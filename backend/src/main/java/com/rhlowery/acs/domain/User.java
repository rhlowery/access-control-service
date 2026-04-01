package com.rhlowery.acs.domain;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

import io.quarkus.runtime.annotations.RegisterForReflection;
import java.util.List;

/**
 * Represents a user in the system.
 *
 * [User domain entity and relationship diagram]
 *
 * @param id Unique identifier (usually email or username)
 * @param name Full name of the user
 * @param email Email address
 * @param role The user's primary role (e.g., ADMIN, STANDARD_USER)
 * @param groups List of group IDs the user belongs to
 * @param persona System-wide persona (Optional)
 */
@RegisterForReflection
@Schema(name = "User", description = "A user profile within the access control system")
public record User(
  @Schema(description = "Unique identifier of the user", examples = {"alice"})
  String id,
  @Schema(description = "Full name of the user", examples = {"Alice User"})
  String name,
  @Schema(description = "Email address", examples = {"alice@example.com"})
  String email,
  @Schema(description = "Primary role", examples = {"ADMIN"})
  String role, // ADMIN, STANDARD_USER
  @Schema(description = "List of associated group IDs", examples = {"[\"admins\"]"})
  List<String> groups,
  @Schema(description = "Current persona assignment", examples = {"ADMIN"})
  String persona
) {}
