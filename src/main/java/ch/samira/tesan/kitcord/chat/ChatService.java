package ch.samira.tesan.kitcord.chat;

import ch.samira.tesan.kitcord.user.User;
import ch.samira.tesan.kitcord.user.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private final UserRepository userRepository;

    public ChatService(ChatRepository chatRepository, UserRepository userRepository) {
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
    }

    public List<Chat> getChats() {
        return chatRepository.findAll();
    }

    public Chat getChatById(Long id) {
        return chatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chat not found"));
    }

    public Chat createChat(CreateChatRequest request) {
        if (request.getUserIds() == null || request.getUserIds().isEmpty()) {
            throw new RuntimeException("At least one user is required");
        }

        if (request.getChatType() == ChatType.DIRECT && request.getUserIds().size() != 2) {
            throw new RuntimeException("Direct chat must have exactly 2 users");
        }

        Chat chat = new Chat();
        chat.setId(null);
        chat.setName(request.getName());
        chat.setChatType(request.getChatType());
        chat.setCreatedAt(LocalDateTime.now());

        Set<User> users = new HashSet<>(userRepository.findAllById(request.getUserIds()));

        if (users.size() != request.getUserIds().size()) {
            throw new RuntimeException("One or more users not found");
        }

        chat.setUsers(users);

        return chatRepository.save(chat);
    }

    public Chat updateChat(Long id, Chat updatedChat) {
        Chat chat = getChatById(id);

        chat.setName(updatedChat.getName());
        chat.setChatType(updatedChat.getChatType());

        return chatRepository.save(chat);
    }

    public void deleteChat(Long id) {
        Chat chat = getChatById(id);
        chatRepository.delete(chat);
    }

    public Chat addUserToChat(Long chatId, Long userId) {
        Chat chat = getChatById(chatId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        chat.getUsers().add(user);

        return chatRepository.save(chat);
    }

    public Chat removeUserFromChat(Long chatId, Long userId) {
        Chat chat = getChatById(chatId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        chat.getUsers().remove(user);

        return chatRepository.save(chat);
    }
}