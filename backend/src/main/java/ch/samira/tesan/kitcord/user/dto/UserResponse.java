package ch.samira.tesan.kitcord.user.dto;

import ch.samira.tesan.kitcord.user.User;

public class UserResponse {

    private Long id;
    private String username;

    public UserResponse(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }
}