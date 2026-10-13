package com.spilltea.dto.profile;

public class UpdateProfileRequest {
    private String displayName;
    private String pseudonym;
    private String bio;
    private String currentlyFeeling;
    private String avatar;
    private String themeAccent;

    public UpdateProfileRequest() {}

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getPseudonym() { return pseudonym; }
    public void setPseudonym(String pseudonym) { this.pseudonym = pseudonym; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getCurrentlyFeeling() { return currentlyFeeling; }
    public void setCurrentlyFeeling(String currentlyFeeling) { this.currentlyFeeling = currentlyFeeling; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getThemeAccent() { return themeAccent; }
    public void setThemeAccent(String themeAccent) { this.themeAccent = themeAccent; }
}
