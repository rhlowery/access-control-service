package com.rhlowery.acs.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.QuarkusTestProfile;
import io.quarkus.test.junit.TestProfile;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.is;

@QuarkusTest
@TestProfile(AuthResourceConfigOverrideTest.OverrideProfile.class)
public class AuthResourceConfigOverrideTest {

    public static class OverrideProfile implements QuarkusTestProfile {
        @Override
        public Map<String, String> getConfigOverrides() {
            return Map.of(
                "oidc.auth-server-url", "http://my-override-oidc-server",
                "oidc.client-id", "my-override-client-id",
                "mock.auth.enabled", "false"
            );
        }
    }

    @Test
    public void testGetConfigOverridden() {
        given()
            .accept(ContentType.JSON)
            .get("/api/auth/config")
            .then()
            .statusCode(200)
            .body("authServerUrl", is("http://my-override-oidc-server"))
            .body("clientId", is("my-override-client-id"))
            .body("isMock", is(false));
    }
}
