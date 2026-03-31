package com.rhlowery.acs.domain;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

import io.quarkus.runtime.annotations.RegisterForReflection;

/**
 * Represents a group in the system.
 * 
 * @param id Unique identifier for the group
 * @param name Display name of the group
 * @param description Brief description of the group's purpose
 * @param persona System-wide persona (Optional)
 */
@RegisterForReflection
@Schema(name = "Group", description = "A user group within the access control system")
public record Group(
    @Schema(description = "Unique identifier of the group", example = "admins")
    String id,
    @Schema(description = "Display name of the group", example = "Administrators")
    String name,
    @Schema(description = "Brief description of the group's purpose", example = "System administrators with full access")
    String description,
    @Schema(description = "Persona associated with this group", example = "ADMIN")
    String persona
) {}
