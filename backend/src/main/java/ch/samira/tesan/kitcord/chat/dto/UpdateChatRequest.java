package ch.samira.tesan.kitcord.chat.dto;

import ch.samira.tesan.kitcord.chat.enums.ChatType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateChatRequest {

    @Schema(example = "School Project Chat")
    @Size(max = 100)
    private String name;

    @Schema(example = "GROUP")
    @NotNull
    private ChatType chatType;

    public UpdateChatRequest() {
    }

    public UpdateChatRequest(String name, ChatType chatType) {
        this.name = name;
        this.chatType = chatType;
    }

    public String getName() {
        return name;
    }

    public ChatType getChatType() {
        return chatType;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setChatType(ChatType chatType) {
        this.chatType = chatType;
    }
}