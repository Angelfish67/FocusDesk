package ch.samira.tesan.kitcord.chat;

import ch.samira.tesan.kitcord.chat.dto.CreateChatRequest;
import ch.samira.tesan.kitcord.chat.dto.UpdateChatRequest;
import ch.samira.tesan.kitcord.chat.enums.ChatType;
import ch.samira.tesan.kitcord.user.User;
import ch.samira.tesan.kitcord.user.UserRepository;
import jakarta.transaction.Transactional;
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

    @Transactional
    public Chat createChat(CreateChatRequest request) {
        if (request.getChatType() == null) {
            throw new RuntimeException("Chat type is required");
        }

        if (request.getUserIds() == null || request.getUserIds().isEmpty()) {
            throw new RuntimeException("Users are required");
        }

        List<User> foundUsers = userRepository.findAllById(request.getUserIds());

        if (foundUsers.size() != request.getUserIds().size()) {
            throw new RuntimeException("One or more users not found");
        }

        if (request.getChatType() == ChatType.DIRECT && foundUsers.size() != 2) {
            throw new RuntimeException("Direct chat must have exactly 2 users");
        }

        Set<User> users = new HashSet<>(foundUsers);

        Chat chat = new Chat();
        chat.setName(request.getName());
        chat.setChatType(request.getChatType());
        chat.setUsers(users);
        chat.setCreatedAt(LocalDateTime.now());

        return chatRepository.save(chat);
    }

    @Transactional
    public Chat updateChat(Long id, UpdateChatRequest request) {
        Chat chat = getChatById(id);

        chat.setName(request.getName());
        chat.setChatType(request.getChatType());

        return chatRepository.save(chat);
    }

    public void deleteChat(Long id) {
        Chat chat = getChatById(id);
        chatRepository.delete(chat);
    }

    @Transactional
    public Chat addUserToChat(Long id, Long userId) {
        Chat chat = getChatById(id);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        chat.getUsers().add(user);

        return chatRepository.save(chat);
    }

    @Transactional
    public Chat removeUserFromChat(Long id, Long userId) {
        Chat chat = getChatById(id);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        chat.getUsers().remove(user);

        return chatRepository.save(chat);
    }
}