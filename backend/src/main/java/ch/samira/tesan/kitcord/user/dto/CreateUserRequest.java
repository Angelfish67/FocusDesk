package ch.samira.tesan.kitcord.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateUserRequest {

    @Schema(example = "samira")
    @NotBlank
    @Size(min = 3, max = 100)
    private String username;

    @Schema(example = "samira@test.ch")
    @NotBlank
    @Email
    private String email;

    @Schema(example = "Samira")
    @NotBlank
    private String firstName;

    @Schema(example = "Tesan")
    @NotBlank
    private String lastName;

    @Schema(example = "Test123!")
    @NotNull
    private String password;

    public CreateUserRequest() {
    }

    public CreateUserRequest(String username, String email, String firstName, String lastName, String password) {
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getPassword() {
        return password;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}