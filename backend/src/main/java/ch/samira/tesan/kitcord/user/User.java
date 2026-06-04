package ch.samira.tesan.kitcord.user;

import ch.samira.tesan.kitcord.chat.Chat;
import ch.samira.tesan.kitcord.message.Message;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 3, max = 100)
    @Column(length = 100, nullable = false, unique = true)
    private String username;

    @NotBlank
    @Email
    @Size(max = 255)
    @Column(length = 255, nullable = false, unique = true)
    private String email;

    @NotBlank
    @Size(max = 100)
    @Column(length = 100, nullable = false)
    private String firstName;

    @NotBlank
    @Size(max = 100)
    @Column(length = 100, nullable = false)
    private String lastName;

    @NotBlank
    @Size(max = 100)
    @Column(length = 100, nullable = false, unique = true)
    private String keycloakId;

    @JsonIgnore
    @ManyToMany(mappedBy = "users")
    private Set<Chat> chats = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL)
    private Set<Message> messages = new HashSet<>();

    public User() {
    }

    public User(String username, String email, String firstName, String lastName, String keycloakId) {
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.keycloakId = keycloakId;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getKeycloakId() {
        return keycloakId;
    }

    public Set<Chat> getChats() {
        return chats;
    }

    public Set<Message> getMessages() {
        return messages;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setKeycloakId(String keycloakId) {
        this.keycloakId = keycloakId;
    }

    public void setChats(Set<Chat> chats) {
        this.chats = chats;
    }

    public void setMessages(Set<Message> messages) {
        this.messages = messages;
    }

    public void addChat(Chat chat) {
        this.chats.add(chat);
    }

    public void removeChat(Chat chat) {
        this.chats.remove(chat);
    }

    public void addMessage(Message message) {
        this.messages.add(message);
        message.setSender(this);
    }

    public void removeMessage(Message message) {
        this.messages.remove(message);
        message.setSender(null);
    }
}