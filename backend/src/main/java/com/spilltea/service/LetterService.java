package com.spilltea.service;

import com.spilltea.dto.letter.LetterRequest;
import com.spilltea.dto.letter.LetterResponse;
import com.spilltea.entity.Letter;
import com.spilltea.entity.User;
import com.spilltea.exception.ResourceNotFoundException;
import com.spilltea.exception.UnauthorizedException;
import com.spilltea.repository.LetterRepository;
import com.spilltea.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class LetterService {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("MMMM d, yyyy", Locale.ENGLISH);

    private final LetterRepository letterRepository;
    private final UserRepository userRepository;

    public LetterService(LetterRepository letterRepository, UserRepository userRepository) {
        this.letterRepository = letterRepository;
        this.userRepository = userRepository;
    }

    public List<LetterResponse> getMyLetters(Long userId) {
        return letterRepository.findByAuthorIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(l -> toResponse(l, userId))
                .collect(Collectors.toList());
    }

    public Page<LetterResponse> getPublicLetters(Pageable pageable) {
        return letterRepository.findByIsPrivateFalseOrderByCreatedAtDesc(pageable)
                .map(l -> toResponse(l, null));
    }

    @Transactional
    public LetterResponse createLetter(LetterRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Letter letter = new Letter();
        letter.setAuthor(user);
        mapRequest(request, letter);

        Letter saved = letterRepository.save(letter);
        return toResponse(saved, userId);
    }

    @Transactional
    public LetterResponse updateLetter(Long letterId, LetterRequest request, Long userId) {
        Letter letter = letterRepository.findByIdAndAuthorId(letterId, userId)
                .orElseThrow(() -> new UnauthorizedException("Letter not found or not yours to edit."));

        mapRequest(request, letter);
        Letter saved = letterRepository.save(letter);
        return toResponse(saved, userId);
    }

    @Transactional
    public void deleteLetter(Long letterId, Long userId) {
        Letter letter = letterRepository.findByIdAndAuthorId(letterId, userId)
                .orElseThrow(() -> new UnauthorizedException("Letter not found or not yours to delete."));

        letterRepository.delete(letter);
    }

    private void mapRequest(LetterRequest request, Letter letter) {
        letter.setRecipient(request.getRecipient());
        letter.setTitle(request.getTitle());
        letter.setBody(request.getContent());
        letter.setCategory(request.getCategory());
        letter.setPrivate(request.isPrivate());
        letter.setEnvelopeColor(request.getEnvelopeColor());
        letter.setStampStyle(request.getStampStyle());
        letter.setWashiColor(request.getWashiColor());
        letter.setPaperTexture(request.getPaperTexture());
    }

    LetterResponse toResponse(Letter letter, Long currentUserId) {
        LetterResponse dto = new LetterResponse();
        dto.setId(letter.getId().toString());
        dto.setRecipient(letter.getRecipient());
        dto.setTitle(letter.getTitle());
        dto.setContent(letter.getBody());
        dto.setDate(letter.getCreatedAt().format(DATE_FORMATTER));
        dto.setCategory(letter.getCategory());
        dto.setPrivate(letter.isPrivate());
        dto.setEnvelopeColor(letter.getEnvelopeColor());
        dto.setStampStyle(letter.getStampStyle());
        dto.setWashiColor(letter.getWashiColor());
        dto.setPaperTexture(letter.getPaperTexture());
        dto.setAuthorPseudonym(letter.getAuthor().getPseudonym());
        dto.setAuthor(currentUserId != null && letter.getAuthor().getId().equals(currentUserId));
        return dto;
    }
}
