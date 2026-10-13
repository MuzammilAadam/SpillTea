package com.spilltea.dto.moodboard;

import java.util.List;

public class ReorderCardsRequest {
    public static class CardOrderItem {
        private Long cardId;
        private Integer displayOrder;

        public CardOrderItem() {}
        public CardOrderItem(Long cardId, Integer displayOrder) {
            this.cardId = cardId;
            this.displayOrder = displayOrder;
        }

        public Long getCardId() { return cardId; }
        public void setCardId(Long cardId) { this.cardId = cardId; }

        public Integer getDisplayOrder() { return displayOrder; }
        public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    }

    private List<CardOrderItem> orders;

    public ReorderCardsRequest() {}

    public List<CardOrderItem> getOrders() { return orders; }
    public void setOrders(List<CardOrderItem> orders) { this.orders = orders; }
}
