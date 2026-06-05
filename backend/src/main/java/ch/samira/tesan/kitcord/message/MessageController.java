package ch.samira.tesan.kitcord.message;

import ch.samira.tesan.kitcord.message.dto.CreateMessageRequest;
import ch.samira.tesan.kitcord.message.dto.UpdateMessageRequest;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@SecurityRequirement(name = "bearerAuth")
@Validated
@RequestMapping("/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PreAuthorize("hasAnyAuthority('ROLE_read', 'ROLE_admin')")
    @GetMapping
    public List<Message> getMessages() {
        return messageService.getMessages();
    }

    @PreAuthorize("hasAnyAuthority('ROLE_read', 'ROLE_admin')")
    @GetMapping("/chat/{chatId}")
    public List<Message> getMessagesByChatId(@PathVariable Long chatId) {
        return messageService.getMessagesByChatId(chatId);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_read', 'ROLE_admin')")
    @GetMapping("/{id}")
    public Message getMessageById(@PathVariable Long id) {
        return messageService.getMessageById(id);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_update', 'ROLE_admin')")
    @PostMapping
    public Message sendMessage(@Valid @RequestBody CreateMessageRequest request) {
        return messageService.sendMessage(request);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_update', 'ROLE_admin')")
    @PutMapping("/{id}")
    public Message updateMessage(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMessageRequest request
    ) {
        return messageService.updateMessage(id, request);
    }

    @PreAuthorize("hasAuthority('ROLE_admin')")
    @DeleteMapping("/{id}")
    public void deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id);
    }
}