package com.rhlowery.acs.dto;

import org.eclipse.microprofile.openapi.annotations.media.Schema;
import java.util.List;

/**
 * Data transfer object for login requests.
 */
@Schema(name = "LoginRequest", description = "Credentials and session parameters for user login")
public class LoginRequest {

    @Schema(description = "The unique identifier of the user", examples = {"admin"}, required = true)
    public String userId;

    @Schema(description = "The password for authentication", examples = {"password"}, required = false)
    public String password;

    @Schema(description = "The ID of the identity provider to use", examples = {"oidc"}, required = false)
    public String providerId;

    @Schema(description = "Legacy persona/role field", examples = {"ADMIN"}, required = false)
    public String role;

    @Schema(description = "Persona to assume for this session", examples = {"ADMIN"}, required = false)
    public String persona;

    @Schema(description = "Optional list of groups for mock authentication", examples = {"[\"admins\"]"}, required = false)
    public List<String> groups;

    public LoginRequest() {}
}
