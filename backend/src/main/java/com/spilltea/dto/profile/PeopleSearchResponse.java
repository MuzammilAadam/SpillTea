package com.spilltea.dto.profile;

public record PeopleSearchResponse(String id, String pseudonym, String displayName, String bio, String avatar,
                                   long kindredCount, boolean following, boolean mutualKindred) {}
