package ch.samira.tesan.kitcord.message.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateMessageRequest {

    @Schema(example = "Hello, this is a message.")
    @NotBlank
    @Size(min = 1, max = 2000)
    private String content;

    @Schema(example = "1")
    @NotNull
    private Long chatId;

    public CreateMessageRequest() {
    }

    public CreateMessageRequest(String content, Long chatId) {
        this.content = content;
        this.chatId = chatId;
    }

    public String getContent() {
        return content;
    }

    public Long getChatId() {
        return chatId;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setChatId(Long chatId) {
        this.chatId = chatId;
    }
}