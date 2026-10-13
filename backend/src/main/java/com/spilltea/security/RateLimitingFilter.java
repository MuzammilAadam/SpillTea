package com.spilltea.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Token bucket rate limiter for sensitive endpoints (login, register, reporting).
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 30;
    private final Map<String, RequestBucket> clientBuckets = new ConcurrentHashMap<>();

    private static class RequestBucket {
        long windowStart = System.currentTimeMillis();
        AtomicInteger count = new AtomicInteger(0);

        synchronized boolean allowRequest(int maxRequests) {
            long now = System.currentTimeMillis();
            if (now - windowStart > 60000) {
                windowStart = now;
                count.set(0);
            }
            return count.incrementAndGet() <= maxRequests;
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();

        // Check if sensitive endpoint
        if (uri.startsWith("/api/auth/login") || uri.startsWith("/api/auth/register") || uri.startsWith("/api/reports")) {
            String clientIp = getClientIp(request);
            String bucketKey = clientIp + ":" + uri;

            RequestBucket bucket = clientBuckets.computeIfAbsent(bucketKey, k -> new RequestBucket());
            if (!bucket.allowRequest(MAX_REQUESTS_PER_MINUTE)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"Too many requests. Please pause and take a gentle breath before trying again.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
