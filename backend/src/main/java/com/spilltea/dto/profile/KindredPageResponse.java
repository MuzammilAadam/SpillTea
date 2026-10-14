package com.spilltea.dto.profile;

import java.util.List;

public record KindredPageResponse(List<KindredProfileResponse> content, int page, int size, long totalElements,
                                  int totalPages, boolean last) {}
