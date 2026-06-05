package com.rhlowery.acs.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;
import java.util.Map;
import java.util.UUID;
import io.quarkus.test.InjectMock;
import io.quarkus.oidc.client.OidcClient;
import io.quarkus.oidc.client.Tokens;
import io.smallrye.mutiny.Uni;
import org.mockito.Mockito;
import org.mockito.ArgumentMatchers;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
public class AuthResourceCoverageTest {

  @InjectMock
  OidcClient oidcClient;

    @Test
    public void testLoginValidationPaths() {
        // 1. Null Body
        given()
            .contentType(ContentType.JSON)
            .post("/api/auth/login")
            .then()
            .statusCode(400)
            .body("error", containsString("Request body is required"));

        // 2. Missing userId
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("password", "secret"))
            .post("/api/auth/login")
            .then()
            .statusCode(400)
            .body("error", containsString("userId is required"));

        // 3. Unknown provider
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("userId", "user", "providerId", "unknown-idp"))
            .post("/api/auth/login")
            .then()
            .statusCode(400)
            .body("error", containsString("Unknown provider"));
            
        // 4. Invalid credentials
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("userId", "admin", "password", "wrong-password", "providerId", "mock"))
            .post("/api/auth/login")
            .then()
            .statusCode(401)
            .body("error", containsString("Invalid credentials"));
    }

    @Test
    public void testRoleToPersonaResolution() {
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("userId", "user-role-test", "password", "secret", "role", "ADMIN"))
            .post("/api/auth/login")
            .then()
            .statusCode(200);
            
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("userId", "user-persona-test", "password", "secret", "role", "ADMIN", "persona", "AUDITOR"))
            .post("/api/auth/login")
            .then()
            .statusCode(200);
    }

    @Test
    public void testJitProvisioning() {
        String newUserId = "new-user-" + UUID.randomUUID();
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("userId", newUserId, "password", "secret"))
            .post("/api/auth/login")
            .then()
            .statusCode(200);
    }

    @Test
    public void testAuthorizeRedirect() {
        given()
            .redirects().follow(false)
            .pathParam("providerId", "mock")
            .get("/api/auth/authorize/{providerId}")
            .then()
            .statusCode(anyOf(is(302), is(200), is(404))); 
    }

    @Test
    public void testCallback() {
      Tokens mockTokens = Mockito.mock(Tokens.class);
      String header = java.util.Base64.getUrlEncoder().encodeToString("{\"alg\":\"RS256\"}".getBytes());
      String payload = java.util.Base64.getUrlEncoder().encodeToString(
        "{\"preferred_username\":\"admin\",\"name\":\"Admin User\",\"groups\":[\"admins\"]}".getBytes()
      );
      String mockIdToken = header + "." + payload + ".sig";
      Mockito.when(mockTokens.get("id_token")).thenReturn(mockIdToken);
      Mockito.when(oidcClient.getTokens(ArgumentMatchers.any()))
          .thenReturn(Uni.createFrom().item(mockTokens));

      given()
          .redirects().follow(false)
          .queryParam("code", "valid-code")
          .queryParam("state", "my_state")
          .cookie("oidc_state", "my_state")
          .get("/api/auth/callback")
          .then()
          .statusCode(303);
          
      given()
          .redirects().follow(false)
          .queryParam("code", "valid-code")
          .queryParam("state", "my_state")
          .cookie("oidc_state", "different")
          .get("/api/auth/callback")
          .then()
          .statusCode(302)
          .header("Location", containsString("CSRF_FAILED"));
    }


    @Test
    public void testMeAnonymous() {
        given()
            .get("/api/auth/me")
            .then()
            .statusCode(401)
            .body("error", containsString("Not authenticated"));
    }
    
    @Test
    @TestSecurity(user = "admin", roles = {"ADMIN"})
    public void testPersonaUpdateSuccess() {
        // First, ensure admin exists in DB via login
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("userId", "admin", "password", "admin"))
            .post("/api/auth/login")
            .then()
            .statusCode(200);

        given()
            .contentType(ContentType.JSON)
            .body("ADMIN")
            .put("/api/auth/users/admin/persona")
            .then()
            .statusCode(200);
    }

    @Test
    @TestSecurity(user = "admin", roles = {"ADMIN"})
    public void testPersonaUpdateFailures() {
        // 1. Update persona for non-existent user
        given()
                .contentType(ContentType.TEXT)
                .body("ADMIN")
                .put("/api/auth/users/non-existent/persona")
                .then()
                .statusCode(404);

        // 2. Update persona for non-existent group
        given()
                .contentType(ContentType.TEXT)
                .body("ADMIN")
                .put("/api/auth/groups/non-existent/persona")
                .then()
                .statusCode(404);
    }
}
