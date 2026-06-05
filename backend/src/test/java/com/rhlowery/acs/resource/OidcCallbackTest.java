package com.rhlowery.acs.resource;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import io.quarkus.oidc.client.OidcClient;
import io.quarkus.oidc.client.Tokens;
import io.smallrye.mutiny.Uni;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import static io.restassured.RestAssured.given;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.mock;
import java.util.Base64;

@QuarkusTest
public class OidcCallbackTest {

  @Inject
  OidcClient oidcClient;

  @BeforeEach
  public void setUp() {
    Mockito.reset(oidcClient);
  }

  @Test
  public void testCallbackCsrfFailure() {
    given()
      .queryParam("code", "auth_code")
      .queryParam("state", "state_param")
      .cookie("oidc_state", "different_state")
      .get("/api/auth/callback")
      .then()
      .statusCode(302)
      .header("Location", org.hamcrest.Matchers.containsString("CSRF_FAILED"));
  }

  @Test
  public void testCallbackSuccessWithExchange() throws Exception {
    Tokens mockTokens = mock(Tokens.class);
    // Construct a mock ID token
    String header = Base64.getUrlEncoder().encodeToString("{\"alg\":\"RS256\"}".getBytes());
    String payload = Base64.getUrlEncoder().encodeToString(
      "{\"preferred_username\":\"oidc-user\",\"name\":\"OIDC User\",\"groups\":[\"admins\"]}".getBytes()
    );
    String signature = Base64.getUrlEncoder().encodeToString("sig".getBytes());
    String mockIdToken = header + "." + payload + "." + signature;

    when(mockTokens.get("id_token")).thenReturn(mockIdToken);
    when(oidcClient.getTokens(any())).thenReturn(Uni.createFrom().item(mockTokens));

    given()
      .queryParam("code", "auth_code")
      .queryParam("state", "state_param")
      .cookie("oidc_state", "state_param")
      .get("/api/auth/callback")
      .then()
      .statusCode(303)
      .header("Location", org.hamcrest.Matchers.equalTo("http://acs.localtest.me/"))
      .cookie("bff_jwt", org.hamcrest.Matchers.notNullValue());
  }
}
