package ch.samira.tesan.kitcord.message.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateMessageRequest {

    @Schema(example = "Updated message text")
    @NotBlank
    @Size(min = 1, max = 2000)
    private String content;

    public UpdateMessageRequest() {
    }

    public UpdateMessageRequest(String content) {
        this.content = content;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}