package com.spilltea;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spilltea.dto.auth.RegisterRequest;
import com.spilltea.dto.comment.CommentRequest;
import com.spilltea.dto.letter.LetterRequest;
import com.spilltea.dto.story.StoryRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class NotificationAndUploadIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String userAToken;
    private String userBToken;
    private Long userAId;
    private Long userBId;

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest regA = new RegisterRequest();
        regA.setEmail("luna@spilltea.com");
        regA.setPassword("secret123");
        regA.setPseudonym("Luna");

        MvcResult resA = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regA)))
                .andExpect(status().isOk())
                .andReturn();

        var nodeA = objectMapper.readTree(resA.getResponse().getContentAsString()).get("data");
        userAToken = nodeA.get("token").asText();
        userAId = nodeA.get("id").asLong();

        RegisterRequest regB = new RegisterRequest();
        regB.setEmail("willow@spilltea.com");
        regB.setPassword("secret123");
        regB.setPseudonym("Willow");

        MvcResult resB = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regB)))
                .andExpect(status().isOk())
                .andReturn();

        var nodeB = objectMapper.readTree(resB.getResponse().getContentAsString()).get("data");
        userBToken = nodeB.get("token").asText();
        userBId = nodeB.get("id").asLong();
    }

    @Test
    void testStoryNotificationsFlow() throws Exception {
        // 1. User A creates a story
        StoryRequest storyReq = new StoryRequest();
        storyReq.setTitle("Things I never said");
        storyReq.setContent("A collection of thoughts left unvoiced in the amber sunlight.");
        storyReq.setCategory("Life");

        MvcResult storyRes = mockMvc.perform(post("/api/stories")
                        .header("Authorization", "Bearer " + userAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(storyReq)))
                .andExpect(status().isOk())
                .andReturn();

        long storyId = objectMapper.readTree(storyRes.getResponse().getContentAsString()).get("data").get("id").asLong();

        // 2. User B reacts to User A's story
        mockMvc.perform(put("/api/stories/" + storyId + "/reactions/hearYou")
                        .header("Authorization", "Bearer " + userBToken))
                .andExpect(status().isOk());

        // 3. User A checks notifications
        MvcResult notifRes = mockMvc.perform(get("/api/me/notifications")
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].read").value(false))
                .andExpect(jsonPath("$.data[0].actorPseudonym").value("Willow"))
                .andExpect(jsonPath("$.data[0].storyId").value(String.valueOf(storyId)))
                .andReturn();

        long notifId = objectMapper.readTree(notifRes.getResponse().getContentAsString()).get("data").get(0).get("id").asLong();

        // 4. Check unread count
        mockMvc.perform(get("/api/me/notifications/unread-count")
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.count").value(1));

        // 5. Mark as read
        mockMvc.perform(patch("/api/me/notifications/" + notifId + "/read")
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.read").value(true));

        // 6. Check unread count after marking read
        mockMvc.perform(get("/api/me/notifications/unread-count")
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.count").value(0));

        // 7. User B comments on User A's story
        CommentRequest commentReq = new CommentRequest();
        commentReq.setContent("This comforted me today, thank you.");
        mockMvc.perform(post("/api/stories/" + storyId + "/comments")
                        .header("Authorization", "Bearer " + userBToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentReq)))
                .andExpect(status().isOk());

        // 8. User A receives comment notification
        mockMvc.perform(get("/api/me/notifications")
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].read").value(false))
                .andExpect(jsonPath("$.data[0].type").value("reply"));
    }

    @Test
    void testLetterNotificationsFlow() throws Exception {
        // 1. User A creates a public letter
        LetterRequest letterReq = new LetterRequest();
        letterReq.setTitle("Dear younger me");
        letterReq.setContent("You do not have to carry the whole world on your shoulders.");
        letterReq.setRecipient("Younger Self");
        letterReq.setPrivate(false);

        MvcResult letterRes = mockMvc.perform(post("/api/letters")
                        .header("Authorization", "Bearer " + userAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(letterReq)))
                .andExpect(status().isOk())
                .andReturn();

        long letterId = objectMapper.readTree(letterRes.getResponse().getContentAsString()).get("data").get("id").asLong();

        // 2. User B reacts to the letter
        mockMvc.perform(put("/api/letters/" + letterId + "/reactions/feltThisToo")
                        .header("Authorization", "Bearer " + userBToken))
                .andExpect(status().isOk());

        // 3. User A checks notifications
        mockMvc.perform(get("/api/me/notifications")
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].letterId").value(String.valueOf(letterId)))
                .andExpect(jsonPath("$.data[0].description").value(org.hamcrest.Matchers.containsString("Dear younger me")));

        // 4. User B replies to the letter
        mockMvc.perform(post("/api/letters/" + letterId + "/replies")
                        .header("Authorization", "Bearer " + userBToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("content", "I needed to read this tonight."))))
                .andExpect(status().isOk());

        // 5. User A gets reply notification
        mockMvc.perform(get("/api/me/notifications")
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].type").value("reply"));
    }

    @Test
    void testGalleryUploadAndAuthGuards() throws Exception {
        // 1. Unauthenticated attempts should be rejected with 401
        mockMvc.perform(post("/api/stories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Test\",\"content\":\"test 12345678901234567890\"}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/letters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Test\",\"content\":\"test 12345678901234567890\"}"))
                .andExpect(status().isUnauthorized());

        // 2. User B uploads image to gallery
        byte[] tinyPng = new byte[] {
                (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
                0x00, 0x00, 0x00, 0x0D
        };
        MockMultipartFile file = new MockMultipartFile(
                "file", "memory.png", "image/png", tinyPng
        );

        MvcResult uploadRes = mockMvc.perform(multipart("/api/me/uploads/images")
                        .file(file)
                        .header("Authorization", "Bearer " + userBToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.originalFilename").value("memory.png"))
                .andExpect(jsonPath("$.data.url").value(org.hamcrest.Matchers.startsWith("/uploads/")))
                .andReturn();

        long uploadId = objectMapper.readTree(uploadRes.getResponse().getContentAsString()).get("data").get("id").asLong();

        // 3. User B lists gallery images
        mockMvc.perform(get("/api/me/uploads/images")
                        .header("Authorization", "Bearer " + userBToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(uploadId));

        // 4. User A cannot delete User B's image
        mockMvc.perform(delete("/api/me/uploads/images/" + uploadId)
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isNotFound());
    }
}
