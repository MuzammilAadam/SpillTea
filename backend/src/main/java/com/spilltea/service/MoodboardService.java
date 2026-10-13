package com.spilltea.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spilltea.dto.moodboard.*;
import com.spilltea.entity.Moodboard;
import com.spilltea.entity.MoodboardCard;
import com.spilltea.entity.User;
import com.spilltea.entity.enums.CardScope;
import com.spilltea.entity.enums.CardType;
import com.spilltea.entity.enums.CardVisibility;
import com.spilltea.exception.BadRequestException;
import com.spilltea.exception.ResourceNotFoundException;
import com.spilltea.exception.UnauthorizedException;
import com.spilltea.repository.MoodboardCardRepository;
import com.spilltea.repository.MoodboardRepository;
import com.spilltea.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MoodboardService {

    private final MoodboardRepository moodboardRepository;
    private final MoodboardCardRepository cardRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    private static final List<String> ALLOWED_CARD_TYPES =
            Arrays.asList("PHOTO", "QUOTE", "NOTE", "TEXT", "RITUAL", "COLLECTION", "DECORATION",
                    "image", "note", "quote", "text", "ritual", "collection", "decoration");

    public MoodboardService(MoodboardRepository moodboardRepository,
                            MoodboardCardRepository cardRepository,
                            UserRepository userRepository) {
        this.moodboardRepository = moodboardRepository;
        this.cardRepository = cardRepository;
        this.userRepository = userRepository;
        this.objectMapper = new ObjectMapper();
    }

    // ── Getters ────────────────────────────────────────────────────────────────

    @Transactional
    public MoodboardDto getMyMoodboard(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Moodboard moodboard = moodboardRepository.findByOwnerId(userId)
                .orElseGet(() -> createDefaultMoodboard(user));

        // Owner sees draft cards
        List<MoodboardCard> cards = cardRepository.findByMoodboardIdAndScopeOrderByDisplayOrderAsc(
                moodboard.getId(), CardScope.DRAFT);

        if (cards.isEmpty()) {
            cards = cardRepository.findByMoodboardIdAndScopeOrderByDisplayOrderAsc(
                    moodboard.getId(), CardScope.PUBLISHED);
        }

        MoodboardDto dto = toMoodboardDto(moodboard, cards, true);
        dto.setHasUnpublishedDraft(!cards.isEmpty() && cards.stream().anyMatch(c -> c.getScope() == CardScope.DRAFT));
        return dto;
    }

    public MoodboardDto getPublicMoodboard(String pseudonym, Long currentUserId) {
        Moodboard moodboard = moodboardRepository.findByOwnerPseudonym(pseudonym)
                .orElseThrow(() -> new ResourceNotFoundException("Moodboard not found for: " + pseudonym));

        if (!moodboard.isPublished()) {
            throw new ResourceNotFoundException("This moodboard is not public yet.");
        }

        boolean isOwner = currentUserId != null && moodboard.getOwner().getId().equals(currentUserId);

        List<MoodboardCard> cards = cardRepository.findByMoodboardIdAndScopeAndVisibilityOrderByDisplayOrderAsc(
                moodboard.getId(), CardScope.PUBLISHED, CardVisibility.PUBLIC);

        return toMoodboardDto(moodboard, cards, isOwner);
    }

    // ── Draft Save ─────────────────────────────────────────────────────────────

    @Transactional
    public MoodboardDto saveDraft(Long userId, SaveMoodboardRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Moodboard moodboard = moodboardRepository.findByOwnerId(userId)
                .orElseGet(() -> createDefaultMoodboard(user));

        // Optimistic lock check
        if (request.getVersion() != null && !request.getVersion().equals(moodboard.getVersion())) {
            throw new BadRequestException("Moodboard has been modified in another session. Please reload and try again.");
        }

        // Update metadata
        if (request.getTitle() != null) moodboard.setTitle(request.getTitle());
        if (request.getDescription() != null) moodboard.setDescription(request.getDescription());
        if (request.getThemeConfig() != null) moodboard.setThemeConfig(request.getThemeConfig());

        moodboardRepository.save(moodboard);

        // Replace draft cards
        cardRepository.deleteByMoodboardIdAndScope(moodboard.getId(), CardScope.DRAFT);

        List<MoodboardCard> draftCards = saveCards(moodboard, request.getCards(), CardScope.DRAFT);
        return toMoodboardDto(moodboard, draftCards, true);
    }

    // ── Publish ────────────────────────────────────────────────────────────────

    @Transactional
    public MoodboardDto publish(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Moodboard moodboard = moodboardRepository.findByOwnerId(userId)
                .orElseGet(() -> createDefaultMoodboard(user));

        // Check for draft cards to promote
        List<MoodboardCard> draftCards = cardRepository.findByMoodboardIdAndScopeOrderByDisplayOrderAsc(
                moodboard.getId(), CardScope.DRAFT);

        if (!draftCards.isEmpty()) {
            // Remove old published cards and promote draft to published
            cardRepository.deleteByMoodboardIdAndScope(moodboard.getId(), CardScope.PUBLISHED);
            draftCards.forEach(c -> c.setScope(CardScope.PUBLISHED));
            cardRepository.saveAll(draftCards);

            // Clean up draft entries
            cardRepository.deleteByMoodboardIdAndScope(moodboard.getId(), CardScope.DRAFT);
        }

        moodboard.setPublished(true);
        Moodboard saved = moodboardRepository.save(moodboard);

        List<MoodboardCard> published = cardRepository.findByMoodboardIdAndScopeOrderByDisplayOrderAsc(
                saved.getId(), CardScope.PUBLISHED);
        return toMoodboardDto(saved, published, true);
    }

    // ── Discard Draft ──────────────────────────────────────────────────────────

    @Transactional
    public MoodboardDto discardDraft(Long userId) {
        Moodboard moodboard = moodboardRepository.findByOwnerId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Moodboard not found"));

        cardRepository.deleteByMoodboardIdAndScope(moodboard.getId(), CardScope.DRAFT);

        List<MoodboardCard> published = cardRepository.findByMoodboardIdAndScopeOrderByDisplayOrderAsc(
                moodboard.getId(), CardScope.PUBLISHED);
        return toMoodboardDto(moodboard, published, true);
    }

    // ── Individual Card Operations ─────────────────────────────────────────────

    @Transactional
    public MoodboardCardDto addCard(Long userId, MoodboardCardDto cardDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Moodboard moodboard = moodboardRepository.findByOwnerId(userId)
                .orElseGet(() -> createDefaultMoodboard(user));

        validateCardType(cardDto.getType());

        MoodboardCard card = toCardEntity(moodboard, cardDto, CardScope.DRAFT);
        MoodboardCard saved = cardRepository.save(card);
        return toCardDto(saved);
    }

    @Transactional
    public MoodboardCardDto updateCard(Long userId, Long cardId, MoodboardCardDto cardDto) {
        MoodboardCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));

        if (!card.getMoodboard().getOwner().getId().equals(userId)) {
            throw new UnauthorizedException("You can only edit cards on your own moodboard.");
        }

        if (cardDto.getType() != null) {
            validateCardType(cardDto.getType());
            card.setCardType(normalizeCardType(cardDto.getType()));
        }
        if (cardDto.getContent() != null || cardDto.getTitle() != null || cardDto.getImage() != null) {
            card.setContentJson(buildContentJson(cardDto));
        }
        if (cardDto.getRotation() != null) card.setRotation(cardDto.getRotation());
        if (cardDto.getPositionX() != null) card.setPositionX(cardDto.getPositionX());
        if (cardDto.getPositionY() != null) card.setPositionY(cardDto.getPositionY());
        if (cardDto.getWidth() != null) card.setWidth(cardDto.getWidth());
        if (cardDto.getHeight() != null) card.setHeight(cardDto.getHeight());
        if (cardDto.getDisplayOrder() != null) card.setDisplayOrder(cardDto.getDisplayOrder());
        if (cardDto.getVisibility() != null) {
            card.setVisibility(cardDto.getVisibility().equalsIgnoreCase("PRIVATE")
                    ? CardVisibility.PRIVATE : CardVisibility.PUBLIC);
        }

        String styleJson = buildStyleJson(cardDto);
        if (styleJson != null) card.setStyleConfigJson(styleJson);

        MoodboardCard saved = cardRepository.save(card);
        return toCardDto(saved);
    }

    @Transactional
    public void deleteCard(Long userId, Long cardId) {
        MoodboardCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));

        if (!card.getMoodboard().getOwner().getId().equals(userId)) {
            throw new UnauthorizedException("You can only delete cards from your own moodboard.");
        }

        cardRepository.delete(card);
    }

    @Transactional
    public List<MoodboardCardDto> reorderCards(Long userId, ReorderCardsRequest request) {
        Moodboard moodboard = moodboardRepository.findByOwnerId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Moodboard not found"));

        for (ReorderCardsRequest.CardOrderItem item : request.getOrders()) {
            cardRepository.findById(item.getCardId()).ifPresent(card -> {
                if (card.getMoodboard().getId().equals(moodboard.getId())) {
                    card.setDisplayOrder(item.getDisplayOrder());
                    cardRepository.save(card);
                }
            });
        }

        List<MoodboardCard> cards = cardRepository.findByMoodboardIdAndScopeOrderByDisplayOrderAsc(
                moodboard.getId(), CardScope.DRAFT);
        if (cards.isEmpty()) {
            cards = cardRepository.findByMoodboardIdAndScopeOrderByDisplayOrderAsc(
                    moodboard.getId(), CardScope.PUBLISHED);
        }
        return cards.stream().map(this::toCardDto).collect(Collectors.toList());
    }

    // ── Default Moodboard Creation ─────────────────────────────────────────────

    private Moodboard createDefaultMoodboard(User user) {
        Moodboard moodboard = new Moodboard(user);
        return moodboardRepository.save(moodboard);
    }

    // ── Card Helpers ───────────────────────────────────────────────────────────

    private List<MoodboardCard> saveCards(Moodboard moodboard, List<MoodboardCardDto> cardDtos, CardScope scope) {
        List<MoodboardCard> cards = new ArrayList<>();
        for (int i = 0; i < cardDtos.size(); i++) {
            MoodboardCardDto dto = cardDtos.get(i);
            validateCardType(dto.getType());
            MoodboardCard card = toCardEntity(moodboard, dto, scope);
            card.setDisplayOrder(i);
            cards.add(card);
        }
        return cardRepository.saveAll(cards);
    }

    private MoodboardCard toCardEntity(Moodboard moodboard, MoodboardCardDto dto, CardScope scope) {
        MoodboardCard card = new MoodboardCard();
        card.setMoodboard(moodboard);
        card.setCardType(normalizeCardType(dto.getType()));
        card.setContentJson(buildContentJson(dto));
        card.setRotation(dto.getRotation() != null ? dto.getRotation() : "rotate-0");
        card.setPositionX(dto.getPositionX() != null ? dto.getPositionX() : 0.0);
        card.setPositionY(dto.getPositionY() != null ? dto.getPositionY() : 0.0);
        card.setWidth(dto.getWidth());
        card.setHeight(dto.getHeight());
        card.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
        card.setVisibility(CardVisibility.PUBLIC);
        card.setScope(scope);
        card.setStyleConfigJson(buildStyleJson(dto));
        return card;
    }

    private String buildContentJson(MoodboardCardDto dto) {
        Map<String, Object> content = new LinkedHashMap<>();
        if (dto.getTitle() != null) content.put("title", dto.getTitle());
        if (dto.getContent() != null) content.put("content", dto.getContent());
        if (dto.getImage() != null) content.put("image", dto.getImage());
        if (dto.getAuthor() != null) content.put("author", dto.getAuthor());
        if (dto.getTime() != null) content.put("time", dto.getTime());
        if (dto.getMood() != null) content.put("mood", dto.getMood());
        try {
            return objectMapper.writeValueAsString(content);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }

    private String buildStyleJson(MoodboardCardDto dto) {
        Map<String, Object> style = new LinkedHashMap<>();
        if (dto.getWashiTape() != null) style.put("washiTape", dto.getWashiTape());
        if (dto.getWashiColor() != null) style.put("washiColor", dto.getWashiColor());
        if (dto.getColor() != null) style.put("color", dto.getColor());
        if (dto.getPaperClip() != null) style.put("paperClip", dto.getPaperClip());
        if (dto.getPressedFlower() != null) style.put("pressedFlower", dto.getPressedFlower());
        if (style.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(style);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    MoodboardCardDto toCardDto(MoodboardCard card) {
        MoodboardCardDto dto = new MoodboardCardDto();
        dto.setId(card.getId().toString());
        dto.setType(card.getCardType().name().toLowerCase());
        dto.setRotation(card.getRotation());
        dto.setPositionX(card.getPositionX());
        dto.setPositionY(card.getPositionY());
        dto.setWidth(card.getWidth());
        dto.setHeight(card.getHeight());
        dto.setDisplayOrder(card.getDisplayOrder());
        dto.setVisibility(card.getVisibility().name());

        // Parse content JSON
        if (card.getContentJson() != null) {
            try {
                Map<String, Object> content = objectMapper.readValue(card.getContentJson(), Map.class);
                dto.setTitle((String) content.get("title"));
                dto.setContent((String) content.get("content"));
                dto.setImage((String) content.get("image"));
                dto.setAuthor((String) content.get("author"));
                dto.setTime((String) content.get("time"));
                dto.setMood((String) content.get("mood"));
            } catch (Exception ignored) {}
        }

        // Parse style JSON
        if (card.getStyleConfigJson() != null) {
            try {
                Map<String, Object> style = objectMapper.readValue(card.getStyleConfigJson(), Map.class);
                dto.setWashiTape((Boolean) style.get("washiTape"));
                dto.setWashiColor((String) style.get("washiColor"));
                dto.setColor((String) style.get("color"));
                dto.setPaperClip((Boolean) style.get("paperClip"));
                dto.setPressedFlower((Boolean) style.get("pressedFlower"));
            } catch (Exception ignored) {}
        }

        return dto;
    }

    private MoodboardDto toMoodboardDto(Moodboard moodboard, List<MoodboardCard> cards, boolean isOwner) {
        MoodboardDto dto = new MoodboardDto();
        dto.setId(moodboard.getId());
        dto.setTitle(moodboard.getTitle());
        dto.setDescription(moodboard.getDescription());
        dto.setThemeConfig(moodboard.getThemeConfig());
        dto.setPublished(moodboard.isPublished());
        dto.setVersion(moodboard.getVersion());
        dto.setOwner(isOwner);
        dto.setCards(cards.stream().map(this::toCardDto).collect(Collectors.toList()));
        return dto;
    }

    private void validateCardType(String type) {
        if (type == null || !ALLOWED_CARD_TYPES.contains(type)) {
            throw new BadRequestException("Invalid card type: " + type + ". Allowed types: " + ALLOWED_CARD_TYPES);
        }
    }

    private CardType normalizeCardType(String type) {
        if (type == null) return CardType.NOTE;
        return switch (type.toLowerCase()) {
            case "image", "photo" -> CardType.PHOTO;
            case "quote" -> CardType.QUOTE;
            case "note" -> CardType.NOTE;
            case "text" -> CardType.TEXT;
            case "ritual" -> CardType.RITUAL;
            case "collection" -> CardType.COLLECTION;
            case "decoration" -> CardType.DECORATION;
            default -> CardType.NOTE;
        };
    }
}
