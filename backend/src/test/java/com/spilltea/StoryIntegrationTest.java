package com.spilltea;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spilltea.dto.auth.RegisterRequest;
import com.spilltea.dto.comment.CommentRequest;
import com.spilltea.dto.story.StoryRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class StoryIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String userToken;

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest reg = new RegisterRequest();
        reg.setEmail("author@spilltea.com");
        reg.setPassword("secret123");
        reg.setPseudonym("WanderingPoet");

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        var node = objectMapper.readTree(json);
        userToken = node.get("data").get("token").asText();
    }

    @Test
    void testCreateStoryAndFeed() throws Exception {
        StoryRequest req = new StoryRequest();
        req.setTitle("A Rainy Afternoon in Kyoto");
        req.setContent("The sound of rain against the cedar wood window panes reminded me of home.");
        req.setCategory("Memory");
        req.setTags(List.of("kyoto", "rain", "nostalgia"));
        req.setPrivate(false);
        req.setDisplayMode(com.spilltea.entity.enums.AuthorDisplayMode.ANONYMOUS);

        // 1. Create Story
        MvcResult postRes = mockMvc.perform(post("/api/stories")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("A Rainy Afternoon in Kyoto"))
                .andReturn();

        var node = objectMapper.readTree(postRes.getResponse().getContentAsString());
        long storyId = node.get("data").get("id").asLong();

        // 2. Fetch Story via public feed
        mockMvc.perform(get("/api/stories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].title").value("A Rainy Afternoon in Kyoto"));

        // 3. Toggle reaction (e.g. "hearYou")
        mockMvc.perform(put("/api/stories/" + storyId + "/reactions/hearYou")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.reactions.hearYou").value(1));

        // 4. Toggle reaction again (should remove it)
        mockMvc.perform(put("/api/stories/" + storyId + "/reactions/hearYou")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.reactions.hearYou").value(0));

        // 5. Add a comment
        CommentRequest commentReq = new CommentRequest();
        commentReq.setContent("This brought tears to my eyes. Beautiful words.");

        mockMvc.perform(post("/api/stories/" + storyId + "/comments")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").value("This brought tears to my eyes. Beautiful words."));
    }
}
