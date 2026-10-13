package com.spilltea.entity.enums;

public enum NotificationType {
    REPLY("reply"),
    REACTION("reaction"),
    SAVED_UPDATE("saved_update"),
    COMFORT("comfort");

    private final String clientKey;

    NotificationType(String clientKey) {
        this.clientKey = clientKey;
    }

    public String getClientKey() {
        return clientKey;
    }

    public static NotificationType fromClientKey(String key) {
        if (key == null) return null;
        for (NotificationType type : values()) {
            if (type.clientKey.equalsIgnoreCase(key) || type.name().equalsIgnoreCase(key)) {
                return type;
            }
        }
        return REPLY;
    }
}
