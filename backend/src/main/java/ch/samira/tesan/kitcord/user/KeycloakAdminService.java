package ch.samira.tesan.kitcord.user;

import ch.samira.tesan.kitcord.user.dto.LoginResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class KeycloakAdminService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${keycloak.server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.admin-client-id}")
    private String adminClientId;

    @Value("${keycloak.admin-client-secret}")
    private String adminClientSecret;

    public String createUser(String username, String email, String firstName, String lastName, String password) {
        String keycloakUserId = createKeycloakUser(username, email, firstName, lastName, password);

        assignRealmRole(keycloakUserId, "ROLE_read");
        assignRealmRole(keycloakUserId, "ROLE_update");

        return keycloakUserId;
    }

    public String createAdminUser(String username, String email, String firstName, String lastName, String password) {
        String keycloakUserId = createKeycloakUser(username, email, firstName, lastName, password);

        assignRealmRole(keycloakUserId, "ROLE_read");
        assignRealmRole(keycloakUserId, "ROLE_update");
        assignRealmRole(keycloakUserId, "ROLE_admin");

        return keycloakUserId;
    }

    public LoginResponse login(String email, String password) {
        String url = serverUrl + "/realms/" + realm + "/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "password");
        form.add("client_id", clientId);
        form.add("username", email);
        form.add("password", password);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);

        try {
            ResponseEntity<LoginResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    LoginResponse.class
            );

            if (response.getBody() == null) {
                throw new RuntimeException("Login failed");
            }

            return response.getBody();

        } catch (HttpStatusCodeException exception) {
            throw new IllegalArgumentException("Login failed: " + exception.getResponseBodyAsString());
        }
    }

    private String createKeycloakUser(String username, String email, String firstName, String lastName, String password) {
        String accessToken = getAdminAccessToken();

        String url = serverUrl + "/admin/realms/" + realm + "/users";

        Map<String, Object> credential = new LinkedHashMap<>();
        credential.put("type", "password");
        credential.put("value", password);
        credential.put("temporary", false);

        Map<String, Object> userBody = new LinkedHashMap<>();
        userBody.put("username", username);
        userBody.put("email", email);
        userBody.put("firstName", firstName);
        userBody.put("lastName", lastName);
        userBody.put("enabled", true);
        userBody.put("emailVerified", true);
        userBody.put("requiredActions", List.of());
        userBody.put("credentials", List.of(credential));

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(userBody, headers);

        try {
            ResponseEntity<Void> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    Void.class
            );

            String location = response.getHeaders().getFirst(HttpHeaders.LOCATION);

            if (location == null || location.isBlank()) {
                throw new RuntimeException("Keycloak user was created, but no user id was returned");
            }

            return location.substring(location.lastIndexOf("/") + 1);

        } catch (HttpStatusCodeException exception) {
            throw new IllegalArgumentException("Keycloak error: " + exception.getResponseBodyAsString());
        }
    }

    private void assignRealmRole(String keycloakUserId, String roleName) {
        String accessToken = getAdminAccessToken();

        String roleUrl = serverUrl + "/admin/realms/" + realm + "/roles/" + roleName;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<Void> roleRequest = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map<String, Object>> roleResponse = restTemplate.exchange(
                    roleUrl,
                    HttpMethod.GET,
                    roleRequest,
                    new ParameterizedTypeReference<>() {
                    }
            );

            Map<String, Object> role = roleResponse.getBody();

            if (role == null) {
                throw new RuntimeException("Keycloak role not found: " + roleName);
            }

            String mappingUrl = serverUrl
                    + "/admin/realms/"
                    + realm
                    + "/users/"
                    + keycloakUserId
                    + "/role-mappings/realm";

            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<List<Map<String, Object>>> mappingRequest =
                    new HttpEntity<>(List.of(role), headers);

            restTemplate.exchange(
                    mappingUrl,
                    HttpMethod.POST,
                    mappingRequest,
                    Void.class
            );

        } catch (HttpStatusCodeException exception) {
            throw new IllegalArgumentException("Keycloak role error: " + exception.getResponseBodyAsString());
        }
    }

    public void resetPassword(String keycloakUserId, String newPassword) {
        String accessToken = getAdminAccessToken();

        String url = serverUrl + "/admin/realms/" + realm + "/users/" + keycloakUserId + "/reset-password";

        Map<String, Object> credential = new LinkedHashMap<>();
        credential.put("type", "password");
        credential.put("value", newPassword);
        credential.put("temporary", false);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(credential, headers);

        try {
            restTemplate.exchange(
                    url,
                    HttpMethod.PUT,
                    request,
                    Void.class
            );
        } catch (HttpStatusCodeException exception) {
            throw new IllegalArgumentException("Keycloak error: " + exception.getResponseBodyAsString());
        }
    }

    public void deleteUser(String keycloakUserId) {
        String accessToken = getAdminAccessToken();

        String url = serverUrl + "/admin/realms/" + realm + "/users/" + keycloakUserId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(
                    url,
                    HttpMethod.DELETE,
                    request,
                    Void.class
            );
        } catch (HttpStatusCodeException exception) {
            throw new IllegalArgumentException("Keycloak error: " + exception.getResponseBodyAsString());
        }
    }

    private String getAdminAccessToken() {
        String url = serverUrl + "/realms/" + realm + "/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");
        form.add("client_id", adminClientId);
        form.add("client_secret", adminClientSecret);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    new ParameterizedTypeReference<>() {
                    }
            );

            Map<String, Object> body = response.getBody();

            if (body == null || body.get("access_token") == null) {
                throw new RuntimeException("Could not get Keycloak admin access token");
            }

            return body.get("access_token").toString();

        } catch (HttpStatusCodeException exception) {
            throw new IllegalArgumentException("Could not get Keycloak admin access token: " + exception.getResponseBodyAsString());
        }
    }
}