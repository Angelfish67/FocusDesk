package ch.samira.tesan.kitcord.chat;

import ch.samira.tesan.kitcord.chat.enums.ChatType;
import ch.samira.tesan.kitcord.user.dto.UserResponse;

import java.time.LocalDateTime;
import java.util.List;

public class ChatResponse {

    private Long id;
    private String name;
    private ChatType chatType;
    private LocalDateTime createdAt;
    private List<UserResponse> users;

    public ChatResponse(Chat chat) {
        this.id = chat.getId();
        this.name = chat.getName();
        this.chatType = chat.getChatType();
        this.createdAt = chat.getCreatedAt();
        this.users = chat.getUsers()
                .stream()
                .map(UserResponse::new)
                .toList();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public ChatType getChatType() {
        return chatType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<UserResponse> getUsers() {
        return users;
    }
}