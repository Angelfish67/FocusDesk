package ch.samira.tesan.kitcord.admin;

import ch.samira.tesan.kitcord.admin.dto.AdminCreateUserRequest;
import ch.samira.tesan.kitcord.admin.dto.AdminUpdateUserRequest;
import ch.samira.tesan.kitcord.chat.Chat;
import ch.samira.tesan.kitcord.message.Message;
import ch.samira.tesan.kitcord.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@Tag(
        name = "Admin",
        description = "REST controller for administrator-only operations"
)
@SecurityRequirement(name = "bearerAuth")
@Validated
@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @Operation(
            summary = "Admin health check",
            description = "Simple endpoint to verify admin access."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Admin access granted"),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content)
    })
    @PreAuthorize("hasAuthority('ROLE_admin')")
    @GetMapping("/health")
    public String adminHealthCheck() {
        return "Admin access granted";
    }

    @Operation(
            summary = "Admin dashboard",
            description = "Returns a simple admin dashboard response."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dashboard loaded successfully"),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content)
    })
    @PreAuthorize("hasAuthority('ROLE_admin')")
    @GetMapping("/dashboard")
    public String dashboard() {
        return "Welcome to the admin dashboard";
    }

    @Operation(
            summary = "Get all users",
            description = "Returns all registered users."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Users loaded successfully"),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content)
    })
    @PreAuthorize("hasAuthority('ROLE_admin')")
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @Operation(
            summary = "Create user",
            description = "Creates a new user as administrator."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content)
    })
    @PreAuthorize("hasAuthority('ROLE_admin')")
    @PostMapping("/users")
    public ResponseEntity<User> createUser(@Valid @RequestBody AdminCreateUserRequest request) {
        User createdUser = adminService.createUser(request);

        return ResponseEntity
                .created(URI.create("/admin/users/" + createdUser.getId()))
                .body(createdUser);
    }

    @Operation(
            summary = "Update user",
            description = "Updates an existing user by id."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @PreAuthorize("hasAuthority('ROLE_admin')")
    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserRequest request
    ) {
        return ResponseEntity.ok(adminService.updateUser(id, request));
    }

    @Operation(
            summary = "Get all chats",
            description = "Returns all chats."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Chats loaded successfully"),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content)
    })
    @PreAuthorize("hasAuthority('ROLE_admin')")
    @GetMapping("/chats")
    public ResponseEntity<List<Chat>> getAllChats() {
        return ResponseEntity.ok(adminService.getAllChats());
    }

    @Operation(
            summary = "Get all messages",
            description = "Returns all messages."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Messages loaded successfully"),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content)
    })
    @PreAuthorize("hasAuthority('ROLE_admin')")
    @GetMapping("/messages")
    public ResponseEntity<List<Message>> getAllMessages() {
        return ResponseEntity.ok(adminService.getAllMessages());
    }

    @Operation(
            summary = "Delete user",
            description = "Deletes a user by id."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "User deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Not authenticated", content = @Content),
            @ApiResponse(responseCode = "403", description = "No permission", content = @Content),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @PreAuthorize("hasAuthority('ROLE_admin')")
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}