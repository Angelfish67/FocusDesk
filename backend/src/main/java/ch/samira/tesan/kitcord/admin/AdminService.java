package ch.samira.tesan.kitcord.admin;

import ch.samira.tesan.kitcord.admin.dto.AdminCreateUserRequest;
import ch.samira.tesan.kitcord.admin.dto.AdminUpdateUserRequest;
import ch.samira.tesan.kitcord.chat.Chat;
import ch.samira.tesan.kitcord.chat.ChatRepository;
import ch.samira.tesan.kitcord.message.Message;
import ch.samira.tesan.kitcord.message.MessageRepository;
import ch.samira.tesan.kitcord.user.User;
import ch.samira.tesan.kitcord.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;

    public AdminService(
            UserRepository userRepository,
            ChatRepository chatRepository,
            MessageRepository messageRepository
    ) {
        this.userRepository = userRepository;
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<Chat> getAllChats() {
        return chatRepository.findAll();
    }

    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    @Transactional
    public User createUser(AdminCreateUserRequest request) {
        User user = new User();

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setKeycloakId(request.getKeycloakId());

        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Long id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setKeycloakId(request.getKeycloakId());

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Chat> chats = chatRepository.findAll();

        for (Chat chat : chats) {
            if (chat.getUsers() != null && chat.getUsers().contains(user)) {
                chat.getUsers().remove(user);
                chatRepository.save(chat);
            }
        }

        userRepository.delete(user);
    }
}