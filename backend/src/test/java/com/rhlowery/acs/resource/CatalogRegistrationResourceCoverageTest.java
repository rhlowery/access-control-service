package com.rhlowery.acs.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;
import java.util.Map;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
public class CatalogRegistrationResourceCoverageTest {

    @Test
    @TestSecurity(user = "admin", roles = {"ADMIN"})
    public void testRegistrationValidation() {
        // 1. Missing id
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("name", "Test Cat", "type", "MOCK"))
            .post("/api/catalog/registrations")
            .then()
            .statusCode(400);

        // 2. Missing type
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("id", "cat1", "name", "Test Cat"))
            .post("/api/catalog/registrations")
            .then()
            .statusCode(201); // Wait, if type is missing it just doesn't register a provider but succeeds?
            // Actually line 36 check id. Let's send null id.
            
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("name", "No ID"))
            .post("/api/catalog/registrations")
            .then()
            .statusCode(400);
            
        // 3. Update non-existent
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("id", "non-existent", "name", "New Name", "type", "MOCK"))
            .patch("/api/catalog/registrations/non-existent") // Use PATCH instead of PUT
            .then()
            .statusCode(404);
            
        // 4. Delete non-existent
        given()
            .delete("/api/catalog/registrations/non-existent")
            .then()
            .statusCode(404);
    }
}
