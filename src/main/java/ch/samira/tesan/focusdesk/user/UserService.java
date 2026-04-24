package ch.samira.tesan.focusdesk.user;

import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getCurrentUser() {

        return userRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No users found"));
    }
}


