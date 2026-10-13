package com.spilltea.service;

import com.spilltea.dto.bookmark.CollectionRequest;
import com.spilltea.dto.bookmark.CollectionResponse;
import com.spilltea.dto.story.StoryResponse;
import com.spilltea.entity.Bookmark;
import com.spilltea.entity.Collection;
import com.spilltea.entity.Story;
import com.spilltea.entity.User;
import com.spilltea.entity.enums.PublicationStatus;
import com.spilltea.exception.BadRequestException;
import com.spilltea.exception.ResourceNotFoundException;
import com.spilltea.exception.UnauthorizedException;
import com.spilltea.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class BookmarkService {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("MMMM d, yyyy", Locale.ENGLISH);

    private final BookmarkRepository bookmarkRepository;
    private final CollectionRepository collectionRepository;
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;
    private final StoryService storyService;

    public BookmarkService(BookmarkRepository bookmarkRepository,
                           CollectionRepository collectionRepository,
                           StoryRepository storyRepository,
                           UserRepository userRepository,
                           StoryService storyService) {
        this.bookmarkRepository = bookmarkRepository;
        this.collectionRepository = collectionRepository;
        this.storyRepository = storyRepository;
        this.userRepository = userRepository;
        this.storyService = storyService;
    }

    @Transactional
    public boolean toggleBookmark(Long storyId, Long userId) {
        Story story = storyRepository.findByIdAndStatus(storyId, PublicationStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        if (bookmarkRepository.existsByUserIdAndStoryId(userId, storyId)) {
            bookmarkRepository.deleteByUserIdAndStoryId(userId, storyId);
            return false;
        } else {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            bookmarkRepository.save(new Bookmark(user, story));
            return true;
        }
    }

    public List<StoryResponse> getBookmarks(Long userId) {
        return bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(b -> storyService.toStoryResponse(b.getStory(), userId, false))
                .collect(Collectors.toList());
    }

    public List<CollectionResponse> getCollections(Long userId) {
        return collectionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toCollectionResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CollectionResponse createCollection(CollectionRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Collection collection = new Collection(user, request.getName(), request.getDescription(), request.isPrivate());
        Collection saved = collectionRepository.save(collection);
        return toCollectionResponse(saved);
    }

    @Transactional
    public CollectionResponse updateCollection(Long collectionId, CollectionRequest request, Long userId) {
        Collection collection = collectionRepository.findByIdAndUserId(collectionId, userId)
                .orElseThrow(() -> new UnauthorizedException("Collection not found or not yours."));

        collection.setName(request.getName());
        collection.setDescription(request.getDescription());
        collection.setPrivate(request.isPrivate());
        Collection saved = collectionRepository.save(collection);
        return toCollectionResponse(saved);
    }

    @Transactional
    public void deleteCollection(Long collectionId, Long userId) {
        Collection collection = collectionRepository.findByIdAndUserId(collectionId, userId)
                .orElseThrow(() -> new UnauthorizedException("Collection not found or not yours."));

        collectionRepository.delete(collection);
    }

    private CollectionResponse toCollectionResponse(Collection collection) {
        CollectionResponse dto = new CollectionResponse();
        dto.setId(collection.getId());
        dto.setName(collection.getName());
        dto.setDescription(collection.getDescription());
        dto.setPrivate(collection.isPrivate());
        dto.setCreatedAt(collection.getCreatedAt().format(DATE_FORMATTER));
        return dto;
    }
}
