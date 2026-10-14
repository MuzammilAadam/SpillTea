package com.spilltea.dto.profile;

public record KindredProfileResponse(String id, String pseudonym, String displayName, String bio, String avatar,
                                     boolean following, boolean mutualKindred) {}
