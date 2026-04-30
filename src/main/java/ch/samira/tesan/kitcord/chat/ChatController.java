package ch.samira.tesan.kitcord.chat;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chats")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping
    public List<Chat> getChats() {
        return chatService.getChats();
    }

    @GetMapping("/{id}")
    public Chat getChatById(@PathVariable Long id) {
        return chatService.getChatById(id);
    }

    @PostMapping
    public Chat createChat(@RequestBody CreateChatRequest request) {
        return chatService.createChat(request);
    }

    @PutMapping("/{id}")
    public Chat updateChat(@PathVariable Long id, @RequestBody Chat chat) {
        return chatService.updateChat(id, chat);
    }

    @DeleteMapping("/{id}")
    public void deleteChat(@PathVariable Long id) {
        chatService.deleteChat(id);
    }

    @PostMapping("/{id}/users/{userId}")
    public Chat addUserToChat(@PathVariable Long id, @PathVariable Long userId) {
        return chatService.addUserToChat(id, userId);
    }

    @DeleteMapping("/{id}/users/{userId}")
    public Chat removeUserFromChat(@PathVariable Long id, @PathVariable Long userId) {
        return chatService.removeUserFromChat(id, userId);
    }
}