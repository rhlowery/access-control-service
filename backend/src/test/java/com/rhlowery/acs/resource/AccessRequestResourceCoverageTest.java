package com.rhlowery.acs.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;
import java.util.Map;
import java.util.List;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
public class AccessRequestResourceCoverageTest {

    @Test
    @TestSecurity(user = "admin", roles = {"ADMIN"})
    public void testUpdateStatusValidation() {
        // 1. Reject without reason (Post uses RejectionRequest DTO)
        given()
            .contentType(ContentType.JSON)
            .body(Map.of())
            .post("/api/storage/requests/123/reject")
            .then()
            .statusCode(400);

        // 2. Reject non-existent
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("reason", "Rejecting non-existent"))
            .post("/api/storage/requests/999/reject")
            .then()
            .statusCode(404);
            
        // 3. Approve non-pending/approved request (already approved/rejected)
        // This is harder without a valid ID, but we can test 404
        given()
            .contentType(ContentType.JSON)
            .post("/api/storage/requests/non-existent/approve")
            .then()
            .statusCode(404);
    }

    @Test
    @TestSecurity(user = "admin", roles = {"ADMIN"})
    public void testVerifyValidation() {
        // 1. Verify non-existent
        given()
            .contentType(ContentType.JSON)
            .post("/api/storage/requests/999/verify")
            .then()
            .statusCode(404);
            
        // 2. Verify non-approved (e.g. pending)
        // Again, 404 since it depends on ID
    }

    @Test
    @TestSecurity(user = "user1", roles = {"STANDARD_USER"})
    public void testCreateRequestValidation() {
        // 1. Empty body
        given()
            .contentType(ContentType.JSON)
            .post("/api/storage/requests")
            .then()
            .statusCode(400);

        // 2. Empty list
        given()
            .contentType(ContentType.JSON)
            .body(List.of())
            .post("/api/storage/requests")
            .then()
            .statusCode(400);
    }

    @Test
    @TestSecurity(user = "admin", roles = {"ADMIN"})
    public void testGetRequestNotFound() {
        given()
            .get("/api/storage/requests/999")
            .then()
            .statusCode(404);
    }
}
