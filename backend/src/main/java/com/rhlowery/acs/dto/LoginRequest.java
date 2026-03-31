package com.rhlowery.acs.dto;

import org.eclipse.microprofile.openapi.annotations.media.Schema;
import java.util.List;

/**
 * Data transfer object for login requests.
 */
@Schema(name = "LoginRequest", description = "Credentials and session parameters for user login")
public class LoginRequest {

    @Schema(description = "The unique identifier of the user", example = "admin", required = true)
    public String userId;

    @Schema(description = "The password for authentication", example = "password", required = false)
    public String password;

    @Schema(description = "The ID of the identity provider to use", example = "oidc", required = false)
    public String providerId;

    @Schema(description = "Legacy persona/role field", example = "ADMIN", required = false)
    public String role;

    @Schema(description = "Persona to assume for this session", example = "ADMIN", required = false)
    public String persona;

    @Schema(description = "Optional list of groups for mock authentication", example = "[\"admins\"]", required = false)
    public List<String> groups;

    public LoginRequest() {}
}
