package ch.samira.tesan.kitcord.chat;

import ch.samira.tesan.kitcord.chat.dto.CreateChatRequest;
import ch.samira.tesan.kitcord.chat.dto.UpdateChatRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "ChatController",
        description = "REST controller for managing direct and group chats"
)
@SecurityRequirement(name = "bearerAuth")
@Validated
@RestController
@RequestMapping("/chats")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @Operation(
            summary = "Get all chats",
            description = "Returns all saved chats."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Chats loaded successfully",
                    content = @Content(schema = @Schema(implementation = ChatResponse.class))),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_read', 'ROLE_admin')")
    @GetMapping
    public ResponseEntity<List<ChatResponse>> getChats() {
        List<ChatResponse> chats = chatService.getChats()
                .stream()
                .map(ChatResponse::new)
                .toList();

        return ResponseEntity.ok(chats);
    }

    @Operation(
            summary = "Get chat by ID",
            description = "Returns one chat by its ID."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Chat found",
                    content = @Content(schema = @Schema(implementation = ChatResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid chat ID", content = @Content),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content),
            @ApiResponse(responseCode = "404", description = "Chat not found", content = @Content)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_read', 'ROLE_admin')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getChatById(
            @Parameter(description = "Chat ID", example = "1", required = true)
            @PathVariable Long id
    ) {
        try {
            return ResponseEntity.ok(new ChatResponse(chatService.getChatById(id)));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .badRequest()
                    .body(exception.getMessage());
        }
    }

    @Operation(
            summary = "Create chat",
            description = "Creates a new direct chat or group chat."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Chat created successfully",
                    content = @Content(schema = @Schema(implementation = ChatResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data", content = @Content),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_update', 'ROLE_admin')")
    @PostMapping
    public ResponseEntity<?> createChat(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Data for the new chat",
                    required = true,
                    content = @Content(schema = @Schema(implementation = CreateChatRequest.class))
            )
            @Valid @RequestBody CreateChatRequest request
    ) {
        try {
            return ResponseEntity.ok(new ChatResponse(chatService.createChat(request)));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .badRequest()
                    .body(exception.getMessage());
        }
    }

    @Operation(
            summary = "Update chat",
            description = "Updates the name or type of an existing chat."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Chat updated successfully",
                    content = @Content(schema = @Schema(implementation = ChatResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data", content = @Content),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content),
            @ApiResponse(responseCode = "404", description = "Chat not found", content = @Content)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_update', 'ROLE_admin')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateChat(
            @Parameter(description = "Chat ID", example = "1", required = true)
            @PathVariable Long id,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Updated chat data",
                    required = true,
                    content = @Content(schema = @Schema(implementation = UpdateChatRequest.class))
            )
            @Valid @RequestBody UpdateChatRequest request
    ) {
        try {
            return ResponseEntity.ok(new ChatResponse(chatService.updateChat(id, request)));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .badRequest()
                    .body(exception.getMessage());
        }
    }

    @Operation(
            summary = "Delete chat",
            description = "Deletes an existing chat by its ID."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Chat deleted successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid chat ID", content = @Content),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content),
            @ApiResponse(responseCode = "404", description = "Chat not found", content = @Content)
    })
    @PreAuthorize("hasAuthority('ROLE_admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteChat(
            @Parameter(description = "Chat ID", example = "1", required = true)
            @PathVariable Long id
    ) {
        try {
            chatService.deleteChat(id);
            return ResponseEntity.ok("Chat deleted successfully");
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .badRequest()
                    .body(exception.getMessage());
        }
    }

    @Operation(
            summary = "Add user to chat",
            description = "Adds an existing user to an existing chat."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User added to chat successfully",
                    content = @Content(schema = @Schema(implementation = ChatResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid chat or user ID", content = @Content),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content),
            @ApiResponse(responseCode = "404", description = "Chat or user not found", content = @Content)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_update', 'ROLE_admin')")
    @PostMapping("/{id}/users/{userId}")
    public ResponseEntity<?> addUserToChat(
            @Parameter(description = "Chat ID", example = "1", required = true)
            @PathVariable Long id,

            @Parameter(description = "User ID", example = "2", required = true)
            @PathVariable Long userId
    ) {
        try {
            return ResponseEntity.ok(new ChatResponse(chatService.addUserToChat(id, userId)));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .badRequest()
                    .body(exception.getMessage());
        }
    }

    @Operation(
            summary = "Remove user from chat",
            description = "Removes an existing user from an existing chat."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User removed from chat successfully",
                    content = @Content(schema = @Schema(implementation = ChatResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid chat or user ID", content = @Content),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content),
            @ApiResponse(responseCode = "404", description = "Chat or user not found", content = @Content)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_update', 'ROLE_admin')")
    @DeleteMapping("/{id}/users/{userId}")
    public ResponseEntity<?> removeUserFromChat(
            @Parameter(description = "Chat ID", example = "1", required = true)
            @PathVariable Long id,

            @Parameter(description = "User ID", example = "2", required = true)
            @PathVariable Long userId
    ) {
        try {
            return ResponseEntity.ok(new ChatResponse(chatService.removeUserFromChat(id, userId)));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .badRequest()
                    .body(exception.getMessage());
        }
    }
}