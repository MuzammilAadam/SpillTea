package com.spilltea.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Pseudonym is required")
    @Size(min = 3, max = 50, message = "Pseudonym must be between 3 and 50 characters")
    private String pseudonym;

    private String displayName;

    public RegisterRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPseudonym() { return pseudonym; }
    public void setPseudonym(String pseudonym) { this.pseudonym = pseudonym; }

    public String getDisplayName() {
        return (displayName != null && !displayName.isBlank()) ? displayName : pseudonym;
    }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
}
