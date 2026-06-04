package ch.samira.tesan.kitcord.user;

import ch.samira.tesan.kitcord.chat.ChatResponse;
import ch.samira.tesan.kitcord.user.dto.CreateUserRequest;
import ch.samira.tesan.kitcord.user.dto.LoginRequest;
import ch.samira.tesan.kitcord.user.dto.LoginResponse;
import ch.samira.tesan.kitcord.user.dto.PasswordChangeRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(
        name = "UserController",
        description = "REST controller for managing users"
)
@RestController
@Validated
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(
            summary = "Create user",
            description = "Creates a new normal user."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User created successfully",
                    content = @Content(schema = @Schema(implementation = User.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data", content = @Content)
    })
    @PostMapping("/create")
    public ResponseEntity<?> createUser(
            @Valid @RequestBody CreateUserRequest request
    ) {
        try {
            return ResponseEntity.ok(userService.createUser(request));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .badRequest()
                    .body(exception.getMessage());
        }
    }

    @Operation(
            summary = "Login user",
            description = "Logs in a user with email and password."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login successful",
                    content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid login data", content = @Content)
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request
    ) {
        try {
            return ResponseEntity.ok(userService.login(request));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .badRequest()
                    .body(exception.getMessage());
        }
    }

    @Operation(
            summary = "Get user by ID",
            description = "Returns a user by their ID.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User found",
                    content = @Content(schema = @Schema(implementation = User.class))),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_read', 'ROLE_admin')")
    @GetMapping("/{id}")
    public User getUserById(
            @Parameter(description = "User ID", example = "1", required = true)
            @PathVariable Long id
    ) {
        return userService.getUserById(id);
    }

    @Operation(
            summary = "Delete user",
            description = "Delete an existing user from database.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User deleted successfully",
                    content = @Content(schema = @Schema(implementation = ChatResponse.class))),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_update', 'ROLE_admin')")
    @DeleteMapping("/delete/{id}")
    public void deleteUser(
            @Parameter(description = "User ID", example = "1", required = true)
            @PathVariable Long id
    ) {
        userService.deleteUser(id);
    }

    @Operation(
            summary = "Change password",
            description = "Change the current password to a new one.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Password changed successfully",
                    content = @Content(schema = @Schema(implementation = ChatResponse.class))),
            @ApiResponse(responseCode = "400", description = "Password not correct", content = @Content),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_update', 'ROLE_admin')")
    @PutMapping("/change_password")
    public void changePassword(
            @Valid @RequestBody PasswordChangeRequest passwordChangeRequest
    ) {
        userService.changePassword(passwordChangeRequest);
    }
}