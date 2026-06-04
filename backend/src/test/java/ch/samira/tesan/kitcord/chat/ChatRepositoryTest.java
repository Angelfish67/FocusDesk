package ch.samira.tesan.kitcord.chat;

import ch.samira.tesan.kitcord.chat.enums.ChatType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ChatRepositoryTest {

    @Autowired
    private ChatRepository chatRepository;

    @Test
    void saveCreateChat() {
        Chat chat = new Chat();
        chat.setName("General");
        chat.setChatType(ChatType.GROUP);

        Chat savedChat = chatRepository.save(chat);

        assertNotNull(savedChat.getId());
        assertEquals("General", savedChat.getName());
        assertEquals(ChatType.GROUP, savedChat.getChatType());
        assertNotNull(savedChat.getCreatedAt());
    }

    @Test
    void findByIdReturnChat() {
        Chat chat = new Chat();
        chat.setName("General");
        chat.setChatType(ChatType.GROUP);

        Chat savedChat = chatRepository.save(chat);

        Optional<Chat> foundChat = chatRepository.findById(savedChat.getId());

        assertTrue(foundChat.isPresent());
        assertEquals(savedChat.getId(), foundChat.get().getId());
        assertEquals("General", foundChat.get().getName());
        assertEquals(ChatType.GROUP, foundChat.get().getChatType());
        assertNotNull(foundChat.get().getCreatedAt());
    }

    @Test
    void findAllReturnAllChats() {
        Chat chat1 = new Chat();
        chat1.setName("General");
        chat1.setChatType(ChatType.GROUP);

        Chat chat2 = new Chat();
        chat2.setName("Direct Chat");
        chat2.setChatType(ChatType.DIRECT);

        chatRepository.save(chat1);
        chatRepository.save(chat2);

        List<Chat> chats = chatRepository.findAll();

        assertEquals(2, chats.size());
    }

    @Test
    void updateChat() {
        Chat chat = new Chat();
        chat.setName("Old Name");
        chat.setChatType(ChatType.GROUP);

        Chat savedChat = chatRepository.save(chat);

        savedChat.setName("New Name");
        savedChat.setChatType(ChatType.DIRECT);

        Chat updatedChat = chatRepository.save(savedChat);

        assertEquals(savedChat.getId(), updatedChat.getId());
        assertEquals("New Name", updatedChat.getName());
        assertEquals(ChatType.DIRECT, updatedChat.getChatType());
        assertNotNull(updatedChat.getCreatedAt());
    }

    @Test
    void deleteeleteChat() {
        Chat chat = new Chat();
        chat.setName("General");
        chat.setChatType(ChatType.GROUP);

        Chat savedChat = chatRepository.save(chat);

        chatRepository.delete(savedChat);

        Optional<Chat> deletedChat = chatRepository.findById(savedChat.getId());

        assertTrue(deletedChat.isEmpty());
    }
}