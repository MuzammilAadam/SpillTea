package com.spilltea.dto.auth;

import com.spilltea.entity.enums.Role;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private Long id;
    private String email;
    private String pseudonym;
    private String displayName;
    private String avatar;
    private String themeAccent;
    private String currentlyFeeling;
    private Role role;

    public AuthResponse() {}

    public AuthResponse(String token, Long id, String email, String pseudonym, String displayName, String avatar, String themeAccent, String currentlyFeeling, Role role) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.pseudonym = pseudonym;
        this.displayName = displayName;
        this.avatar = avatar;
        this.themeAccent = themeAccent;
        this.currentlyFeeling = currentlyFeeling;
        this.role = role;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPseudonym() { return pseudonym; }
    public void setPseudonym(String pseudonym) { this.pseudonym = pseudonym; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getThemeAccent() { return themeAccent; }
    public void setThemeAccent(String themeAccent) { this.themeAccent = themeAccent; }

    public String getCurrentlyFeeling() { return currentlyFeeling; }
    public void setCurrentlyFeeling(String currentlyFeeling) { this.currentlyFeeling = currentlyFeeling; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
