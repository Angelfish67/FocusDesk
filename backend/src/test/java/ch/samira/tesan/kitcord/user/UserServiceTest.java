package ch.samira.tesan.kitcord.user;

import ch.samira.tesan.kitcord.user.dto.CreateUserRequest;
import ch.samira.tesan.kitcord.user.dto.LoginRequest;
import ch.samira.tesan.kitcord.user.dto.LoginResponse;
import ch.samira.tesan.kitcord.user.dto.PasswordChangeRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private KeycloakAdminService keycloakAdminService;

    @InjectMocks
    private UserService userService;

    private CreateUserRequest createUserRequest;
    private User user;

    @BeforeEach
    void setUp() {

        createUserRequest = new CreateUserRequest();
        createUserRequest.setUsername("samira");
        createUserRequest.setEmail("samira@test.ch");
        createUserRequest.setFirstName("Samira");
        createUserRequest.setLastName("Tesan");
        createUserRequest.setPassword("Test123!");

        user = new User();
        user.setId(1L);
        user.setUsername("samira");
        user.setEmail("samira@test.ch");
        user.setFirstName("Samira");
        user.setLastName("Tesan");
        user.setKeycloakId("kc-123");
    }

    @Test
    void createUser_shouldCreateUserSuccessfully() {

        when(userRepository.existsByUsername(createUserRequest.getUsername()))
                .thenReturn(false);

        when(userRepository.existsByEmail(createUserRequest.getEmail()))
                .thenReturn(false);

        when(keycloakAdminService.createUser(
                createUserRequest.getUsername(),
                createUserRequest.getEmail(),
                createUserRequest.getFirstName(),
                createUserRequest.getLastName(),
                createUserRequest.getPassword()
        )).thenReturn("kc-123");

        when(userRepository.save(any(User.class)))
                .thenReturn(user);

        User createdUser = userService.createUser(createUserRequest);

        assertNotNull(createdUser);
        assertEquals("samira", createdUser.getUsername());
        assertEquals("samira@test.ch", createdUser.getEmail());
        assertEquals("Samira", createdUser.getFirstName());
        assertEquals("Tesan", createdUser.getLastName());
        assertEquals("kc-123", createdUser.getKeycloakId());

        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUser_shouldThrowException_whenUsernameAlreadyExists() {

        when(userRepository.existsByUsername(createUserRequest.getUsername()))
                .thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.createUser(createUserRequest)
        );

        assertEquals("Username already exists", exception.getMessage());

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void createUser_shouldThrowException_whenEmailAlreadyExists() {

        when(userRepository.existsByUsername(createUserRequest.getUsername()))
                .thenReturn(false);

        when(userRepository.existsByEmail(createUserRequest.getEmail()))
                .thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.createUser(createUserRequest)
        );

        assertEquals("Email already exists", exception.getMessage());

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void createUser_shouldThrowException_whenPasswordIsInvalid() {

        createUserRequest.setPassword("test");

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.createUser(createUserRequest)
        );

        assertTrue(exception.getMessage().contains("Password"));
    }

    @Test
    void login_shouldReturnLoginResponse() {

        LoginRequest request = new LoginRequest();
        request.setEmail("samira@test.ch");
        request.setPassword("Test123!");

        LoginResponse response = new LoginResponse();
        response.setAccessToken("access-token");

        when(keycloakAdminService.login(
                request.getEmail(),
                request.getPassword()
        )).thenReturn(response);

        LoginResponse result = userService.login(request);

        assertNotNull(result);
        assertEquals("access-token", result.getAccessToken());
    }

    @Test
    void getUserById_shouldReturnUser() {

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        User foundUser = userService.getUserById(1L);

        assertNotNull(foundUser);
        assertEquals("samira", foundUser.getUsername());
    }

    @Test
    void getUserById_shouldThrowException_whenUserNotFound() {

        when(userRepository.findById(1L))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> userService.getUserById(1L)
        );

        assertEquals("User not found", exception.getMessage());
    }

    @Test
    void deleteUser_shouldDeleteUserSuccessfully() {

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        userService.deleteUser(1L);

        verify(keycloakAdminService).deleteUser("kc-123");
        verify(userRepository).delete(user);
    }

    @Test
    void changePassword_shouldResetPasswordSuccessfully() {

        PasswordChangeRequest request = new PasswordChangeRequest();
        request.setId(1L);
        request.setNewPassword("NewPassword123!");

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        userService.changePassword(request);

        verify(keycloakAdminService).resetPassword(
                "kc-123",
                "NewPassword123!"
        );
    }
}