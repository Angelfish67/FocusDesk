package ch.samira.tesan.kitcord.chat.dto;

import ch.samira.tesan.kitcord.chat.enums.ChatType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class CreateChatRequest {

    @Schema(example = "School Group Chat")
    @Size(max = 100)
    private String name;

    @Schema(example = "GROUP")
    @NotNull
    private ChatType chatType;

    @Schema(example = "[1, 2]")
    @NotEmpty
    private List<@NotNull Long> userIds;

    public CreateChatRequest() {
    }

    public CreateChatRequest(String name, ChatType chatType, List<Long> userIds) {
        this.name = name;
        this.chatType = chatType;
        this.userIds = userIds;
    }

    public String getName() {
        return name;
    }

    public ChatType getChatType() {
        return chatType;
    }

    public List<Long> getUserIds() {
        return userIds;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setChatType(ChatType chatType) {
        this.chatType = chatType;
    }

    public void setUserIds(List<Long> userIds) {
        this.userIds = userIds;
    }
}