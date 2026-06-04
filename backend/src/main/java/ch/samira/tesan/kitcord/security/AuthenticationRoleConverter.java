package ch.samira.tesan.kitcord.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

public class AuthenticationRoleConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final String clientId;

    public AuthenticationRoleConverter(String clientId) {
        this.clientId = clientId;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();

        authorities.addAll(extractRealmRoles(jwt));
        authorities.addAll(extractClientRoles(jwt));

        return new JwtAuthenticationToken(jwt, authorities);
    }

    private Collection<SimpleGrantedAuthority> extractRealmRoles(Jwt jwt) {
        Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();

        Map<String, Object> realmAccess = jwt.getClaim("realm_access");

        if (realmAccess == null) {
            return authorities;
        }

        Object rolesObject = realmAccess.get("roles");

        if (!(rolesObject instanceof List<?> roles)) {
            return authorities;
        }

        for (Object roleObject : roles) {
            if (roleObject instanceof String role) {
                authorities.add(new SimpleGrantedAuthority(normalizeRole(role)));
            }
        }

        return authorities;
    }

    private Collection<SimpleGrantedAuthority> extractClientRoles(Jwt jwt) {
        Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();

        Map<String, Object> resourceAccess = jwt.getClaim("resource_access");

        if (resourceAccess == null) {
            return authorities;
        }

        Object clientObject = resourceAccess.get(clientId);

        if (!(clientObject instanceof Map<?, ?> clientAccess)) {
            return authorities;
        }

        Object rolesObject = clientAccess.get("roles");

        if (!(rolesObject instanceof List<?> roles)) {
            return authorities;
        }

        for (Object roleObject : roles) {
            if (roleObject instanceof String role) {
                authorities.add(new SimpleGrantedAuthority(normalizeRole(role)));
            }
        }

        return authorities;
    }

    private String normalizeRole(String role) {
        if (role.startsWith("ROLE_")) {
            return role;
        }

        return "ROLE_" + role;
    }
}