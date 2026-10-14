package com.spilltea.dto.profile;

import com.spilltea.dto.moodboard.MoodboardCardDto;
import java.util.ArrayList;
import java.util.List;
import com.spilltea.dto.story.StoryResponse;

public class UserProfileResponse {

    public static class ProfileStats {
        private long storiesShared = 0;
        private long lettersPenciled = 0;
        private long momentsEmpathized = 0;

        public ProfileStats() {}
        public ProfileStats(long storiesShared, long lettersPenciled, long momentsEmpathized) {
            this.storiesShared = storiesShared;
            this.lettersPenciled = lettersPenciled;
            this.momentsEmpathized = momentsEmpathized;
        }

        public long getStoriesShared() { return storiesShared; }
        public void setStoriesShared(long storiesShared) { this.storiesShared = storiesShared; }

        public long getLettersPenciled() { return lettersPenciled; }
        public void setLettersPenciled(long lettersPenciled) { this.lettersPenciled = lettersPenciled; }

        public long getMomentsEmpathized() { return momentsEmpathized; }
        public void setMomentsEmpathized(long momentsEmpathized) { this.momentsEmpathized = momentsEmpathized; }
    }

    public static class QuoteItem {
        private String text;
        private String author;

        public QuoteItem() {}
        public QuoteItem(String text, String author) {
            this.text = text;
            this.author = author;
        }

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }

        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }
    }

    public static class ReflectionItem {
        private String prompt;
        private String answer;

        public ReflectionItem() {}
        public ReflectionItem(String prompt, String answer) {
            this.prompt = prompt;
            this.answer = answer;
        }

        public String getPrompt() { return prompt; }
        public void setPrompt(String prompt) { this.prompt = prompt; }

        public String getAnswer() { return answer; }
        public void setAnswer(String answer) { this.answer = answer; }
    }

    private String id;
    private String pseudonym;
    private String displayName;
    private String bio;
    private String avatar;
    private String themeAccent;
    private String joinedDate;
    private String currentlyFeeling;
    private ProfileStats stats = new ProfileStats();
    private KindredStatsResponse kindredStats = new KindredStatsResponse(0, 0, 0);
    private List<QuoteItem> favoriteQuotes = new ArrayList<>();
    private List<ReflectionItem> reflectionAnswers = new ArrayList<>();
    private List<MoodboardCardDto> moodboard = new ArrayList<>();
    private boolean isSelf = false;
    private List<StoryResponse> stories = new ArrayList<>();

    public UserProfileResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPseudonym() { return pseudonym; }
    public void setPseudonym(String pseudonym) { this.pseudonym = pseudonym; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getThemeAccent() { return themeAccent; }
    public void setThemeAccent(String themeAccent) { this.themeAccent = themeAccent; }

    public String getJoinedDate() { return joinedDate; }
    public void setJoinedDate(String joinedDate) { this.joinedDate = joinedDate; }

    public String getCurrentlyFeeling() { return currentlyFeeling; }
    public void setCurrentlyFeeling(String currentlyFeeling) { this.currentlyFeeling = currentlyFeeling; }

    public ProfileStats getStats() { return stats; }
    public void setStats(ProfileStats stats) { this.stats = stats; }

    public KindredStatsResponse getKindredStats() { return kindredStats; }
    public void setKindredStats(KindredStatsResponse kindredStats) { this.kindredStats = kindredStats; }

    public List<QuoteItem> getFavoriteQuotes() { return favoriteQuotes; }
    public void setFavoriteQuotes(List<QuoteItem> favoriteQuotes) { this.favoriteQuotes = favoriteQuotes; }

    public List<ReflectionItem> getReflectionAnswers() { return reflectionAnswers; }
    public void setReflectionAnswers(List<ReflectionItem> reflectionAnswers) { this.reflectionAnswers = reflectionAnswers; }

    public List<MoodboardCardDto> getMoodboard() { return moodboard; }
    public void setMoodboard(List<MoodboardCardDto> moodboard) { this.moodboard = moodboard; }

    public boolean isSelf() { return isSelf; }
    public void setSelf(boolean self) { isSelf = self; }

    public List<StoryResponse> getStories() { return stories; }
    public void setStories(List<StoryResponse> stories) { this.stories = stories; }
}
