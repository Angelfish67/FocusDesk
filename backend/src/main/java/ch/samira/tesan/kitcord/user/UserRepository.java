package ch.samira.tesan.kitcord.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Optional<User> findByKeycloakId(String keycloakId);

    Optional<User> findByEmail(String email);
}