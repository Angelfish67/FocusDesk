package ch.samira.tesan.kitcord.message;

import ch.samira.tesan.kitcord.chat.Chat;
import ch.samira.tesan.kitcord.chat.ChatRepository;
import ch.samira.tesan.kitcord.user.User;
import ch.samira.tesan.kitcord.user.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;
    private final UserRepository userRepository;

    public MessageService(
            MessageRepository messageRepository,
            ChatRepository chatRepository,
            UserRepository userRepository
    ) {
        this.messageRepository = messageRepository;
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
    }

    public List<Message> getMessagesByChat(Long chatId) {
        return messageRepository.findByChatId(chatId);
    }

    public Message getMessageById(Long id) {
        return messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
    }

    public Message sendMessage(Long chatId, Message message) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        User sender = userRepository.findById(message.getSender().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        message.setChat(chat);
        message.setSender(sender);
        message.setSentAt(LocalDateTime.now());
        message.setEditedAt(null);

        return messageRepository.save(message);
    }

    public Message updateMessage(Long id, Message updatedMessage) {
        Message message = getMessageById(id);

        message.setContent(updatedMessage.getContent());
        message.setEditedAt(LocalDateTime.now());

        return messageRepository.save(message);
    }

    public void deleteMessage(Long id) {
        Message message = getMessageById(id);
        messageRepository.delete(message);
    }
}