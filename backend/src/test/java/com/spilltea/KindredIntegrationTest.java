package com.spilltea;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spilltea.repository.FollowRepository;
import com.spilltea.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class KindredIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired FollowRepository followRepository;
    @Autowired NotificationRepository notificationRepository;

    @Test
    void followsAreUniqueCountsAreRealAndNotificationsOnlyFollowSuccess() throws Exception {
        JsonNode follower = register("a@example.com", "kindred-a");
        JsonNode followed = register("b@example.com", "kindred-b");
        String followerToken = follower.get("token").asText();
        long followedId = followed.get("id").asLong();

        mockMvc.perform(get("/api/profiles/{id}/stats", followedId))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.storiesCount").value(0))
                .andExpect(jsonPath("$.data.kindredCount").value(0)).andExpect(jsonPath("$.data.myKindredCount").value(0));

        mockMvc.perform(put("/api/profiles/{id}/follow", followedId).header("Authorization", "Bearer " + followerToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.kindredCount").value(1));
        mockMvc.perform(put("/api/profiles/{id}/follow", followedId).header("Authorization", "Bearer " + followerToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.kindredCount").value(1));

        mockMvc.perform(get("/api/profiles/{id}/stats", follower.get("id").asLong()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.myKindredCount").value(1));
        org.junit.jupiter.api.Assertions.assertEquals(1, followRepository.count());
        org.junit.jupiter.api.Assertions.assertEquals(1, notificationRepository.count());

        mockMvc.perform(delete("/api/profiles/{id}/follow", followedId).header("Authorization", "Bearer " + followerToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.kindredCount").value(0));
        org.junit.jupiter.api.Assertions.assertEquals(0, followRepository.count());

        mockMvc.perform(put("/api/profiles/{id}/follow", follower.get("id").asLong()).header("Authorization", "Bearer " + followerToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unauthenticatedFollowIsRejected() throws Exception {
        JsonNode followed = register("public@example.com", "public-kindred");
        mockMvc.perform(put("/api/profiles/{id}/follow", followed.get("id").asLong()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void publicProfileAndPeopleSearchReturnTheRegisteredUser() throws Exception {
        JsonNode profile = register("search@example.com", "searchable-soul");

        mockMvc.perform(get("/api/profiles/search").param("q", "SEARCHABLE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].pseudonym").value("searchable-soul"))
                .andExpect(jsonPath("$.data.content[0].kindredCount").value(0));

        mockMvc.perform(get("/api/profiles/search").param("q", "searchable-soul"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.content[0].id").value(profile.get("id").asText()));

        mockMvc.perform(get("/api/profiles/search").param("q", "no-match"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.content").isEmpty());

        mockMvc.perform(get("/api/profiles/search").param("q", "s"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.content").isEmpty());
    }

    @Test
    void profileEditsAndPhotoBelongToTheAuthenticatedOwner() throws Exception {
        JsonNode owner = register("owner@example.com", "profile-owner");
        JsonNode other = register("other@example.com", "profile-other");
        String ownerToken = owner.get("token").asText();
        String otherToken = other.get("token").asText();

        mockMvc.perform(patch("/api/me/profile").header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"bio\":\"A persistent little note\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.bio").value("A persistent little note"));

        mockMvc.perform(patch("/api/me/profile").header("Authorization", "Bearer " + otherToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"bio\":\"Other note\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/profiles/profile-owner"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.bio").value("A persistent little note"));

        byte[] pngHeader = new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
        mockMvc.perform(multipart("/api/me/profile/photo").file(new MockMultipartFile("file", "avatar.png", "image/png", pngHeader))
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.avatar").value(org.hamcrest.Matchers.startsWith("/uploads/")));
    }

    private JsonNode register(String email, String pseudonym) throws Exception {
        String body = objectMapper.writeValueAsString(java.util.Map.of(
                "email", email, "password", "password123", "pseudonym", pseudonym));
        String response = mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("data");
    }
}
