package ch.samira.tesan.kitcord.chat;

import ch.samira.tesan.kitcord.chat.dto.CreateChatRequest;
import ch.samira.tesan.kitcord.chat.dto.UpdateChatRequest;
import ch.samira.tesan.kitcord.chat.enums.ChatType;
import ch.samira.tesan.kitcord.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatControllerTest {

    @Mock
    private ChatService chatService;

    @InjectMocks
    private ChatController chatController;

    private Chat chat;
    private User userOne;
    private User userTwo;

    @BeforeEach
    void setUp() {
        userOne = new User();
        userOne.setId(1L);
        userOne.setUsername("samira");
        userOne.setEmail("samira@test.ch");
        userOne.setFirstName("Samira");
        userOne.setLastName("Tesan");

        userTwo = new User();
        userTwo.setId(2L);
        userTwo.setUsername("testuser");
        userTwo.setEmail("test@test.ch");
        userTwo.setFirstName("Test");
        userTwo.setLastName("User");

        chat = new Chat();
        chat.setId(1L);
        chat.setName("Test Chat");
        chat.setChatType(ChatType.GROUP);
        chat.setUsers(new HashSet<>(Set.of(userOne, userTwo)));
    }

    @Test
    void getChatsShouldReturnAllChats() {
        when(chatService.getChats()).thenReturn(List.of(chat));

        ResponseEntity<List<ChatResponse>> response = chatController.getChats();

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(1L, response.getBody().get(0).getId());
        assertEquals("Test Chat", response.getBody().get(0).getName());
        assertEquals(ChatType.GROUP, response.getBody().get(0).getChatType());

        verify(chatService).getChats();
    }

    @Test
    void getChatByIdShouldReturnChat() {
        when(chatService.getChatById(1L)).thenReturn(chat);

        ResponseEntity<?> response = chatController.getChatById(1L);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertInstanceOf(ChatResponse.class, response.getBody());

        ChatResponse body = (ChatResponse) response.getBody();

        assertEquals(1L, body.getId());
        assertEquals("Test Chat", body.getName());
        assertEquals(ChatType.GROUP, body.getChatType());

        verify(chatService).getChatById(1L);
    }

    @Test
    void getChatByIdShouldReturnBadRequestWhenChatDoesNotExist() {
        when(chatService.getChatById(99L)).thenThrow(new IllegalArgumentException("Chat not found"));

        ResponseEntity<?> response = chatController.getChatById(99L);

        assertEquals(400, response.getStatusCode().value());
        assertEquals("Chat not found", response.getBody());

        verify(chatService).getChatById(99L);
    }

    @Test
    void createChatShouldReturnCreatedChat() {
        CreateChatRequest request = new CreateChatRequest();
        request.setName("Test Chat");
        request.setChatType(ChatType.GROUP);
        request.setUserIds(List.of(1L, 2L));

        when(chatService.createChat(request)).thenReturn(chat);

        ResponseEntity<?> response = chatController.createChat(request);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertInstanceOf(ChatResponse.class, response.getBody());

        ChatResponse body = (ChatResponse) response.getBody();

        assertEquals(1L, body.getId());
        assertEquals("Test Chat", body.getName());
        assertEquals(ChatType.GROUP, body.getChatType());

        verify(chatService).createChat(request);
    }

    @Test
    void createChatShouldReturnBadRequestWhenInputIsInvalid() {
        CreateChatRequest request = new CreateChatRequest();
        request.setName("Invalid Chat");
        request.setChatType(ChatType.DIRECT);
        request.setUserIds(List.of(1L));

        when(chatService.createChat(request)).thenThrow(new IllegalArgumentException("Direct chat must have exactly two users"));

        ResponseEntity<?> response = chatController.createChat(request);

        assertEquals(400, response.getStatusCode().value());
        assertEquals("Direct chat must have exactly two users", response.getBody());

        verify(chatService).createChat(request);
    }

    @Test
    void updateChatShouldReturnUpdatedChat() {
        UpdateChatRequest request = new UpdateChatRequest();
        request.setName("Updated Chat");
        request.setChatType(ChatType.GROUP);

        Chat updatedChat = new Chat();
        updatedChat.setId(1L);
        updatedChat.setName("Updated Chat");
        updatedChat.setChatType(ChatType.GROUP);
        updatedChat.setUsers(new HashSet<>(Set.of(userOne, userTwo)));

        when(chatService.updateChat(1L, request)).thenReturn(updatedChat);

        ResponseEntity<?> response = chatController.updateChat(1L, request);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertInstanceOf(ChatResponse.class, response.getBody());

        ChatResponse body = (ChatResponse) response.getBody();

        assertEquals(1L, body.getId());
        assertEquals("Updated Chat", body.getName());
        assertEquals(ChatType.GROUP, body.getChatType());

        verify(chatService).updateChat(1L, request);
    }

    @Test
    void updateChatShouldReturnBadRequestWhenChatDoesNotExist() {
        UpdateChatRequest request = new UpdateChatRequest();
        request.setName("Updated Chat");
        request.setChatType(ChatType.GROUP);

        when(chatService.updateChat(99L, request)).thenThrow(new IllegalArgumentException("Chat not found"));

        ResponseEntity<?> response = chatController.updateChat(99L, request);

        assertEquals(400, response.getStatusCode().value());
        assertEquals("Chat not found", response.getBody());

        verify(chatService).updateChat(99L, request);
    }

    @Test
    void deleteChatShouldReturnSuccessMessage() {
        doNothing().when(chatService).deleteChat(1L);

        ResponseEntity<?> response = chatController.deleteChat(1L);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Chat deleted successfully", response.getBody());

        verify(chatService).deleteChat(1L);
    }

    @Test
    void deleteChatShouldReturnBadRequestWhenChatDoesNotExist() {
        doThrow(new IllegalArgumentException("Chat not found")).when(chatService).deleteChat(99L);

        ResponseEntity<?> response = chatController.deleteChat(99L);

        assertEquals(400, response.getStatusCode().value());
        assertEquals("Chat not found", response.getBody());

        verify(chatService).deleteChat(99L);
    }

    @Test
    void addUserToChatShouldReturnUpdatedChat() {
        when(chatService.addUserToChat(1L, 2L)).thenReturn(chat);

        ResponseEntity<?> response = chatController.addUserToChat(1L, 2L);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertInstanceOf(ChatResponse.class, response.getBody());

        ChatResponse body = (ChatResponse) response.getBody();

        assertEquals(1L, body.getId());
        assertEquals("Test Chat", body.getName());
        assertEquals(ChatType.GROUP, body.getChatType());

        verify(chatService).addUserToChat(1L, 2L);
    }

    @Test
    void addUserToChatShouldReturnBadRequestWhenUserDoesNotExist() {
        when(chatService.addUserToChat(1L, 99L)).thenThrow(new IllegalArgumentException("User not found"));

        ResponseEntity<?> response = chatController.addUserToChat(1L, 99L);

        assertEquals(400, response.getStatusCode().value());
        assertEquals("User not found", response.getBody());

        verify(chatService).addUserToChat(1L, 99L);
    }

    @Test
    void removeUserFromChatShouldReturnUpdatedChat() {
        when(chatService.removeUserFromChat(1L, 2L)).thenReturn(chat);

        ResponseEntity<?> response = chatController.removeUserFromChat(1L, 2L);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertInstanceOf(ChatResponse.class, response.getBody());

        ChatResponse body = (ChatResponse) response.getBody();

        assertEquals(1L, body.getId());
        assertEquals("Test Chat", body.getName());
        assertEquals(ChatType.GROUP, body.getChatType());

        verify(chatService).removeUserFromChat(1L, 2L);
    }

    @Test
    void removeUserFromChatShouldReturnBadRequestWhenUserDoesNotExist() {
        when(chatService.removeUserFromChat(1L, 99L)).thenThrow(new IllegalArgumentException("User not found"));

        ResponseEntity<?> response = chatController.removeUserFromChat(1L, 99L);

        assertEquals(400, response.getStatusCode().value());
        assertEquals("User not found", response.getBody());
        verify(chatService).removeUserFromChat(1L, 99L);
    }
}