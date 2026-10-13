package com.spilltea;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spilltea.dto.auth.RegisterRequest;
import com.spilltea.dto.letter.LetterRequest;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class LetterIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String authorToken;
    private String otherUserToken;

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest r1 = new RegisterRequest();
        r1.setEmail("author@spilltea.com");
        r1.setPassword("pass123");
        r1.setPseudonym("SecretWriter");
        MvcResult res1 = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r1)))
                .andExpect(status().isOk())
                .andReturn();
        authorToken = objectMapper.readTree(res1.getResponse().getContentAsString()).get("data").get("token").asText();

        RegisterRequest r2 = new RegisterRequest();
        r2.setEmail("other@spilltea.com");
        r2.setPassword("pass123");
        r2.setPseudonym("CuriousReader");
        MvcResult res2 = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r2)))
                .andExpect(status().isOk())
                .andReturn();
        otherUserToken = objectMapper.readTree(res2.getResponse().getContentAsString()).get("data").get("token").asText();
    }

    @Test
    void testPrivateLetterPrivacy() throws Exception {
        LetterRequest privateReq = new LetterRequest();
        privateReq.setTitle("To My Younger Self");
        privateReq.setContent("You survived the coldest winters. Be kind to yourself.");
        privateReq.setRecipient("Self");
        privateReq.setPaperTexture("kraft");
        privateReq.setPrivate(true);

        mockMvc.perform(post("/api/letters")
                        .header("Authorization", "Bearer " + authorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(privateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.private").value(true));

        // Public feed should NOT contain the private letter
        mockMvc.perform(get("/api/public/letters"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content.length()").value(0));

        // Author should see their private letter
        mockMvc.perform(get("/api/me/letters")
                        .header("Authorization", "Bearer " + authorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        // Other user should NOT see author's private letters in /me/letters
        mockMvc.perform(get("/api/me/letters")
                        .header("Authorization", "Bearer " + otherUserToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(0));
    }
}
