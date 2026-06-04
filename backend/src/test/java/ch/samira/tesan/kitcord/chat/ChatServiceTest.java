package ch.samira.tesan.kitcord.chat;

import ch.samira.tesan.kitcord.chat.dto.CreateChatRequest;
import ch.samira.tesan.kitcord.chat.enums.ChatType;
import ch.samira.tesan.kitcord.user.User;
import ch.samira.tesan.kitcord.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ChatRepository chatRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ChatService chatService;

    private Chat chat;
    private User user1;
    private User user2;

    @BeforeEach
    void setUp() {
        user1 = createUser(1L, "samira1");
        user2 = createUser(2L, "testuser2");

        chat = new Chat();
        chat.setId(1L);
        chat.setName("Test Chat");
        chat.setChatType(ChatType.GROUP);
        chat.setUsers(new HashSet<>(Set.of(user1, user2)));
    }

    @Test
    void getChatsReturnsAllChats() {
        when(chatRepository.findAll()).thenReturn(List.of(chat));

        List<Chat> chats = chatService.getChats();

        assertEquals(1, chats.size());
        assertEquals("Test Chat", chats.get(0).getName());

        verify(chatRepository).findAll();
    }

    private User createUser(Long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        return user;
    }

    private CreateChatRequest createRequest(String name, ChatType chatType, List<Long> userIds) {
        CreateChatRequest request = new CreateChatRequest();
        request.setName(name);
        request.setChatType(chatType);
        request.setUserIds(userIds);
        return request;
    }
}