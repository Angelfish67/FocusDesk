package ch.samira.tesan.kitcord.message;

import ch.samira.tesan.kitcord.chat.Chat;
import ch.samira.tesan.kitcord.chat.ChatRepository;
import ch.samira.tesan.kitcord.message.dto.CreateMessageRequest;
import ch.samira.tesan.kitcord.message.dto.UpdateMessageRequest;
import ch.samira.tesan.kitcord.user.User;
import ch.samira.tesan.kitcord.user.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

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

    public List<Message> getMessages() {
        return messageRepository.findAll();
    }

    public Message getMessageById(Long id) {
        return messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
    }

    @Transactional
    public Message sendMessage(CreateMessageRequest request) {
        Chat chat = chatRepository.findById(request.getChatId())
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        User sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!chat.getUsers().contains(sender)) {
            throw new RuntimeException("Sender is not a member of this chat");
        }

        Message message = new Message();
        message.setContent(request.getContent());
        message.setChat(chat);
        message.setSender(sender);

        return messageRepository.save(message);
    }

    @Transactional
    public Message updateMessage(Long id, UpdateMessageRequest request) {
        Message message = getMessageById(id);
        message.setContent(request.getContent());

        return messageRepository.save(message);
    }

    public void deleteMessage(Long id) {
        Message message = getMessageById(id);
        messageRepository.delete(message);
    }
}