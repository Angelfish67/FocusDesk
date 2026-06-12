# Kitcord – Projektkonfiguration

## 1. Allgemeine Informationen

### Projektname
Kitcord

### Technologie
- Spring Boot 4
- Java 26
- Maven
- PostgreSQL
- Keycloak
- Swagger / OpenAPI

### Authentifizierung
OAuth2 Resource Server mit JWT über Keycloak

### API Base URL

```text
http://localhost:9090
```

## application.yml

```yaml
server:
  port: 9090

spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8080/realms/kitcord

app:
  name: kitcord

keycloak:
  server-url: http://localhost:8080
  realm: kitcord
  client-id: kitcord
  admin-client-id: kitcord_backend
  admin-client-secret: chsuCzGIr50BGxqsBDVyRmUzXATsvaST
```

---

# 2. Voraussetzungen

Folgende Software muss installiert sein:

- Java 26
- Maven
- PostgreSQL
- Keycloak 26.x
- Git

---

# 3. Projektstruktur

Das Projekt verwendet folgende Architektur:

```text
Controller
↓
Service
↓
Repository
↓
PostgreSQL Datenbank
```

Verwendete Hauptmodule:

- User Management
- Chat Management
- Message Management
- Authentication / Authorization
- Swagger API Dokumentation

---

# 4. Datenbankkonfiguration

## PostgreSQL

### Verbindung

| Einstellung | Wert |
|---|---|
| Host | localhost |
| Port | 5432 |
| Datenbank | kitcord |
| Benutzer | postgres |
| Passwort | 123456 |

---

## Datenbank erstellen

Die Datenbank muss vor dem Start existieren.

SQL:

```sql
CREATE DATABASE kitcord;
```

---

# 4. Datenbankkonfiguration

## PostgreSQL

### Verbindung

| Einstellung | Wert |
|---|---|
| Host | localhost |
| Port | 5432 |
| Datenbank | kitcord |
| Benutzer | postgres |
| Passwort | 123456 |

---

## Datenbank erstellen

Die Datenbank muss vor dem Start existieren.

SQL:

```sql
CREATE DATABASE kitcord;
```

---

## application-postgres.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/kitcord
    username: postgres
    password: 123456
    driver-class-name: org.postgresql.Driver

  jpa:
    show-sql: true
    generate-ddl: true
    hibernate:
      ddl-auto: update
```

---

## application-h2.yml

```yaml
spring:
  h2:
    console:
      enabled: true
      path: /h2-console

  datasource:
    url: jdbc:h2:mem:kitcord
    username: sa
    password:
    driverClassName: org.h2.Driver

  jpa:
    show-sql: true
    generate-ddl: true
    hibernate:
      ddl-auto: update
```

---

---

# 5. Keycloak Konfiguration

## Keycloak starten

Im Keycloak Ordner:

```bash
cd C:\Pfad\keycloak-26.6.0\bin
```

Danach:

```bash
.\kc.bat start-dev --http-port=8080 --bootstrap-admin-username=admin --bootstrap-admin-password=admin
```

---

## Keycloak Login

| Einstellung | Wert |
|---|---|
| URL | http://localhost:8080 |
| Username | admin |
| Passwort | admin |

Admin Console:

```text
http://localhost:8080/admin
```

---

# 6. Realm importieren

Im Projekt befindet sich:

```text
kitcord-realm.json
```

Diesen Realm in Keycloak importieren:

1. Keycloak öffnen
2. Create Realm auswählen
3. Import wählen
4. kitcord-realm.json importieren

---

# 7. Realm Informationen

## Realm

```text
kitcord
```

---

## Clients

### Frontend Client

Der Frontend Client wird für Benutzerlogin und JWT Token verwendet.

| Einstellung | Wert |
|---|---|
| Client ID | kitcord |
| Client Type | OpenID Connect |
| Access Type | Public |
| Direct Access Grants | aktiviert |
| Service Accounts | deaktiviert |

---

### Backend Client

Der Backend Client wird für administrative Backend-Aufgaben verwendet.

| Einstellung | Wert |
|---|---|
| Client ID | kitcord_backend |
| Client Type | OpenID Connect |
| Access Type | Confidential |
| Direct Access Grants | aktiviert |
| Service Accounts | aktiviert |

---

## Rollen

Folgende Rollen werden verwendet:

- ROLE_admin
- ROLE_read
- ROLE_update

Die Rollen existieren als:
- Realm Roles
- Client Roles im Client `kitcord`

---

# 8. Ports

| Service | Port |
|---|---|
| Spring Boot API | 9090 |
| Keycloak | 8080 |
| PostgreSQL | 5432 |

---

# 9. Projekt starten

## Repository klonen

```bash
git clone <REPOSITORY_URL>
```

---

## In Projekt wechseln

```bash
cd Kitcord
```

---

## Maven Dependencies installieren

```bash
mvn clean install
```

---

## Backend mit PostgreSQL starten

```bash
mvn spring-boot:run "-Dspring-boot.run.profiles=postgres"
```

---

## Backend mit H2 starten

```bash
mvn spring-boot:run "-Dspring-boot.run.profiles=h2"
```

H2 Console:

```text
http://localhost:9090/h2-console
```

---

# 10. Swagger UI

Swagger UI:

```text
http://localhost:9090/swagger-ui.html
```

OpenAPI JSON:

```text
http://localhost:9090/v3/api-docs
```

---

# 11. JWT Token holen

## Endpoint

POST

```text
http://localhost:8080/realms/kitcord/protocol/openid-connect/token
```

---

## Headers

```text
Content-Type: application/x-www-form-urlencoded
```

---

## Body

```text
grant_type=password
client_id=kitcord
username=admin
password=0210
```

---

## Beispiel Response

```json
{
  "access_token": "eyJhbGciOi...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "token_type": "Bearer"
}
```

---

# 12. Bearer Token verwenden

Beispiel:

```text
Authorization: Bearer <ACCESS_TOKEN>
```

---

# 13. Beispiel API Requests

## Benutzer abrufen

```http
GET http://localhost:9090/admin/users
Authorization: Bearer <ACCESS_TOKEN>
```

---

## Chat erstellen

```http
POST http://localhost:9090/chats
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

Body:

```json
{
  "name": "General",
  "chatType": "GROUP"
}
```

---

# 14. Security

Die API verwendet:

- OAuth2 Resource Server
- JWT Bearer Authentication
- Rollenbasierte Autorisierung

Alle Endpoints sind abgesichert.

---

## Rollenbasierte Zugriffe

| Rolle | Zugriff |
|---|---|
| ROLE_admin | Vollzugriff |
| ROLE_read | Lesen |
| ROLE_update | Bearbeiten |

---

# 15. Testing

Das Projekt enthält:

- JUnit Tests
- Repository Tests
- Controller Tests
- Swagger API Dokumentation

---

## Tests ausführen

```bash
mvn test
```

---

# 16. Verwendete Technologien

| Technologie | Zweck |
|---|---|
| Spring Boot | Backend Framework |
| Spring Security | Security |
| Keycloak | Authentication |
| PostgreSQL | Datenbank |
| Hibernate / JPA | ORM |
| Swagger / OpenAPI | API Dokumentation |
| Maven | Build Tool |
| JUnit | Testing |

---

# 17. Wichtige Hinweise

- Ohne gültigen JWT Token sind alle Endpoints gesperrt ausser Login und Create von einem User.
- PostgreSQL muss laufen bevor das Backend gestartet wird.
- Keycloak muss laufen bevor Login Requests funktionieren.
- Die Datenbanktabellen werden automatisch erstellt.
- Swagger unterstützt Bearer Authentication.
- Der Client `kitcord` wird für Benutzerlogin verwendet.
- Der Client `kitcord_backend` wird für Backend-Services und Keycloak-Administration verwendet.
- Die Rollen müssen exakt gleich heißen wie im Backend.
- Der Wert von `app.name` muss exakt dem Keycloak Client entsprechen.

---

# 18. Entwickler

Projekt im Rahmen von Modul 295 erstellt.