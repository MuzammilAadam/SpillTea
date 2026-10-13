package com.spilltea.entity.enums;

public enum ReactionType {
    HEAR_YOU("hearYou"),
    FELT_THIS_TOO("feltThisToo"),
    THANK_YOU("thankYou"),
    SENDING_SUPPORT("sendingSupport");

    private final String clientKey;

    ReactionType(String clientKey) {
        this.clientKey = clientKey;
    }

    public String getClientKey() {
        return clientKey;
    }

    public static ReactionType fromClientKey(String key) {
        if (key == null) return null;
        for (ReactionType type : values()) {
            if (type.clientKey.equalsIgnoreCase(key) || type.name().equalsIgnoreCase(key)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown reaction type: " + key);
    }
}
