package ch.samira.tesan.kitcord.message;

import ch.samira.tesan.kitcord.message.dto.CreateMessageRequest;
import ch.samira.tesan.kitcord.message.dto.UpdateMessageRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "MessageController",
        description = "REST controller for managing chat messages"
)
@RestController
@SecurityRequirement(name = "bearerAuth")
@Validated
@RequestMapping("/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @Operation(
            summary = "Get all messages",
            description = "Returns all saved messages."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Messages loaded successfully",
                    content = @Content(schema = @Schema(implementation = Message.class))),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_read', 'ROLE_admin')")
    @GetMapping
    public List<Message> getMessages() {
        return messageService.getMessages();
    }

    @Operation(
            summary = "Get message by ID",
            description = "Returns one message by its ID."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Message found",
                    content = @Content(schema = @Schema(implementation = Message.class))),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content),
            @ApiResponse(responseCode = "404", description = "Message not found", content = @Content)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_read', 'ROLE_admin')")
    @GetMapping("/{id}")
    public Message getMessageById(
            @Parameter(description = "Message ID", example = "1", required = true)
            @PathVariable Long id
    ) {
        return messageService.getMessageById(id);
    }

    @Operation(
            summary = "Send message",
            description = "Creates and sends a new message to a chat."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Message sent successfully",
                    content = @Content(schema = @Schema(implementation = Message.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data", content = @Content),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_update', 'ROLE_admin')")
    @PostMapping
    public Message sendMessage(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Data for the new message",
                    required = true,
                    content = @Content(schema = @Schema(implementation = CreateMessageRequest.class))
            )
            @Valid @RequestBody CreateMessageRequest request
    ) {
        return messageService.sendMessage(request);
    }

    @Operation(
            summary = "Update message",
            description = "Updates the content of an existing message."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Message updated successfully",
                    content = @Content(schema = @Schema(implementation = Message.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data", content = @Content),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content),
            @ApiResponse(responseCode = "404", description = "Message not found", content = @Content)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_update', 'ROLE_admin')")
    @PutMapping("/{id}")
    public Message updateMessage(
            @Parameter(description = "Message ID", example = "1", required = true)
            @PathVariable Long id,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Updated message data",
                    required = true,
                    content = @Content(schema = @Schema(implementation = UpdateMessageRequest.class))
            )
            @Valid @RequestBody UpdateMessageRequest request
    ) {
        return messageService.updateMessage(id, request);
    }

    @Operation(
            summary = "Delete message",
            description = "Deletes an existing message by its ID."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Message deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content),
            @ApiResponse(responseCode = "404", description = "Message not found", content = @Content)
    })
    @PreAuthorize("hasAuthority('ROLE_admin')")
    @DeleteMapping("/{id}")
    public void deleteMessage(
            @Parameter(description = "Message ID", example = "1", required = true)
            @PathVariable Long id
    ) {
        messageService.deleteMessage(id);
    }
}