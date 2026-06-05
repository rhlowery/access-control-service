package com.rhlowery.acs.service;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class TokenServiceTest {

  @Inject
  TokenService tokenService;

  @Test
  public void testGenerateTokenWithNullRole() {
    String token = tokenService.generateToken(
      "user-123", "User 123", List.of("group1"), null, "ADMIN"
    );
    assertNotNull(token);
  }
}
