package ch.samira.tesan.kitcord.message;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/chats/{chatId}/messages")
    public List<Message> getMessagesByChat(@PathVariable Long chatId) {
        return messageService.getMessagesByChat(chatId);
    }

    @GetMapping("/messages/{id}")
    public Message getMessageById(@PathVariable Long id) {
        return messageService.getMessageById(id);
    }

    @PostMapping("/chats/{chatId}/messages")
    public Message sendMessage(@PathVariable Long chatId, @RequestBody Message message) {
        return messageService.sendMessage(chatId, message);
    }

    @PutMapping("/messages/{id}")
    public Message updateMessage(@PathVariable Long id, @RequestBody Message message) {
        return messageService.updateMessage(id, message);
    }

    @DeleteMapping("/messages/{id}")
    public void deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id);
    }
}