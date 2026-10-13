package com.spilltea;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spilltea.dto.auth.RegisterRequest;
import com.spilltea.dto.moodboard.MoodboardCardDto;
import com.spilltea.dto.moodboard.SaveMoodboardRequest;
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
public class MoodboardIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String userToken;
    private String userPseudonym = "VintageScrapbooker";

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest reg = new RegisterRequest();
        reg.setEmail("vintage@spilltea.com");
        reg.setPassword("secret123");
        reg.setPseudonym(userPseudonym);

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
    void testDraftAndPublishMoodboard() throws Exception {
        // 1. Get my moodboard (should return default empty board)
        mockMvc.perform(get("/api/moodboards/me")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.owner").value(true));

        // 2. Save a draft with 2 cards
        SaveMoodboardRequest saveReq = new SaveMoodboardRequest();
        saveReq.setTitle("Autumn Whispers");
        saveReq.setDescription("Dried eucalyptus, cinnamon sticks, and old paper");

        MoodboardCardDto card1 = new MoodboardCardDto();
        card1.setType("note");
        card1.setContent("Breathe gently into this new season.");
        card1.setRotation("rotate-1");
        card1.setWashiTape(true);

        MoodboardCardDto card2 = new MoodboardCardDto();
        card2.setType("quote");
        card2.setContent("Leaves are falling, books are calling.");
        card2.setAuthor("Anonymous Tea Drinker");
        card2.setRotation("-rotate-2");

        saveReq.setCards(List.of(card1, card2));

        mockMvc.perform(put("/api/moodboards/me/draft")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(saveReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.cards.length()").value(2));

        // 3. Check public view before publish (should NOT have cards yet or should reflect unpublished)
        mockMvc.perform(get("/api/profiles/" + userPseudonym + "/moodboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.cards.length()").value(0));

        // 4. Publish
        mockMvc.perform(post("/api/moodboards/me/publish")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.published").value(true))
                .andExpect(jsonPath("$.data.cards.length()").value(2));

        // 5. Check public view after publish
        mockMvc.perform(get("/api/profiles/" + userPseudonym + "/moodboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.published").value(true))
                .andExpect(jsonPath("$.data.cards.length()").value(2));
    }
}
