package com.rhlowery.acs.resource;

import com.rhlowery.acs.dto.LoginRequest;
import com.rhlowery.acs.service.IdentityProvider;
import com.rhlowery.acs.service.TokenService;
import com.rhlowery.acs.service.UserService;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.enums.SecuritySchemeType;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.security.SecurityScheme;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

import java.util.*;
import java.util.stream.Collectors;

import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.UriInfo;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@jakarta.enterprise.context.ApplicationScoped
@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Authentication", description = "Endpoints for user authentication and session management")
@OpenAPIDefinition(
    info = @Info(title = "ACS Backend API", version = "1.0.0-SNAPSHOT"),
    security = @SecurityRequirement(name = "jwt")
)
@SecurityScheme(
    securitySchemeName = "jwt",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT"
)
public class AuthResource {

    private static final Logger LOG = Logger.getLogger(AuthResource.class);

    @Inject
    Instance<IdentityProvider> providers;

    @Inject
    TokenService tokenService;

    @Inject
    UserService userService;

    @Inject
    JsonWebToken jwt;
    
    @Inject
    SecurityIdentity securityIdentity;

    @POST
    @Path("/login")
    @PermitAll
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Login", description = "Authenticates a user and returns a session cookie")
    public Response login(LoginRequest body) {
        if (body == null) {
            return Response.status(400).entity(Map.of("error", "Request body is required")).build();
        }

        String userId = body.userId;
        String providerId = body.providerId;
        String personaInBody = body.persona;
        
        if (userId == null || userId.trim().isEmpty()) {
            return Response.status(400).entity(Map.of("error", "userId is required")).build();
        }

        if (personaInBody == null) {
            String roleInBody = body.role;
            if (roleInBody != null && !"STANDARD_USER".equals(roleInBody)) {
                personaInBody = roleInBody;
            }
        }

        // For demo/simplified auth
        String userName = userId != null ? userId : "Anonymous";
        List<String> groups = new ArrayList<>(List.of("standard-users"));
        if (body.groups != null) {
            groups.addAll(body.groups);
        }
        String finalProviderId = providerId;
        
        // JIT Provisioning for locally authenticated users (Tests)
        String finalUserId = userId;
        String finalUserName = userName;
        String finalPersona = personaInBody;

        if (userId != null) {
            Optional<com.rhlowery.acs.domain.User> localUser = userService.getUser(userId);
            if (localUser.isEmpty()) {
                com.rhlowery.acs.domain.User newUser = new com.rhlowery.acs.domain.User(
                    finalUserId, finalUserName, finalUserId + "@example.com", "STANDARD_USER", List.copyOf(groups), finalPersona
                );
                userService.saveUser(newUser);
                LOG.info("JIT provisioned user on login: " + finalUserId);
            }
        }

        try {
            if (providerId == null || "local".equals(providerId)) {
                providerId = "mock";
            }
            if (providerId != null) {
                final String searchId = providerId;
                Optional<IdentityProvider> providerOpt = providers.stream()
                        .filter(p -> p.getId().equals(searchId))
                        .findFirst();
                if (providerOpt.isEmpty()) {
                    return Response.status(400).entity(Map.of("error", "Unknown provider: " + providerId)).build();
                }
                IdentityProvider provider = providerOpt.get();
                
                // Compatibility with internal provider maps
                Map<String, Object> credentials = new HashMap<>();
                credentials.put("userId", body.userId);
                credentials.put("password", body.password);
                credentials.put("providerId", body.providerId);
                credentials.put("persona", body.persona);
                credentials.put("groups", body.groups);

                Optional<Map<String, Object>> authResult = provider.authenticate(credentials);
                if (authResult.isEmpty()) {
                    return Response.status(401).entity(Map.of("error", "Invalid credentials via " + finalProviderId)).build();
                }

                userId = (String) authResult.get().get("userId");
                userName = authResult.get().containsKey("userName") ? (String) authResult.get().get("userName")
                        : userName;
                groups = provider.getGroups(userId);
                String authPersona = (String) authResult.get().get("persona");
                if (authPersona != null && !authPersona.isBlank()) {
                    finalPersona = authPersona;
                }
            }

            // Group-based role (legacy)
            String role = (groups != null && groups.contains("admins")) ? "ADMIN" : "STANDARD_USER";

            // If still null, we'll let it be null in the token so Augmentor can resolve it.
            String token = tokenService.generateToken(userId, userName, groups, role, finalPersona);

            return Response.ok(Map.of(
                    "status", "success",
                    "userId", userId,
                    "providerId", finalProviderId != null ? finalProviderId : "mock",
                    "token", token))
                    .header("Set-Cookie", "bff_jwt=" + token + "; Path=/; HttpOnly; SameSite=Strict")
                    .build();
        } catch (Exception e) {
            LOG.error("Login error", e);
            return Response.status(500).entity(Map.of("error", e.getMessage())).build();
        }
    }

    @POST
    @Path("/logout")
    @PermitAll
    @Operation(summary = "Logout", description = "Invalidates the current user session")
    public Response logout() {
        return Response.ok(Map.of("status", "success"))
                .header("Set-Cookie", "bff_jwt=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict")
                .build();
    }

    @GET
    @Path("/authorize/{providerId}")
    @PermitAll
    @Operation(summary = "Authorize Redirect", description = "Redirects the browser to the OIDC provider login page")
    public Response authorize(@PathParam("providerId") String providerId, @Context UriInfo uriInfo) {
        String authServerUrl = System.getenv("OIDC_AUTH_SERVER_URL");
        String clientId = System.getenv("OIDC_CLIENT_ID");
        String redirectUri = uriInfo.getBaseUriBuilder()
                .path("/api/auth/callback")
                .queryParam("providerId", providerId)
                .build().toString();

        if (authServerUrl == null || authServerUrl.isEmpty() || "mock".equals(authServerUrl)) {
             return Response.status(302).location(URI.create("/login?error=OIDC_DISABLED")).build();
        }

        String authUrl = authServerUrl + "/protocol/openid-connect/auth" +
                "?client_id=" + clientId +
                "&response_type=code" +
                "&scope=openid profile email" +
                "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8);

        return Response.status(302).location(URI.create(authUrl)).build();
    }

    @GET
    @Path("/callback")
    @PermitAll
    @Operation(summary = "OIDC Callback", description = "Handles the return from the OIDC provider")
    public Response callback(@QueryParam("code") String code, @QueryParam("providerId") String providerId, @Context UriInfo uriInfo) {
        if (code == null) {
            return Response.status(302).location(URI.create("/login?error=INVALID_CODE")).build();
        }

        // Simulating identity resolution for stabilization.
        // In a real flow, a Token exchange would happen here.
        String userId = "admin";
        String userName = "Admin User";
        List<String> groups = List.of("admins");
        String persona = "ADMIN";
        
        String token = tokenService.generateToken(userId, userName, groups, "ADMIN", persona);
        
        // Redirect back to frontend
        URI frontendHome = URI.create("http://acs.localtest.me/");
        
        return Response.seeOther(frontendHome)
                .header("Set-Cookie", "bff_jwt=" + token + "; Path=/; HttpOnly; SameSite=Strict")
                .build();
    }

    @GET
    @Path("/me")
    @Operation(summary = "GetCurrentUser", description = "Returns the profile of the currently authenticated user")
    @APIResponse(responseCode = "200", description = "Success")
    @APIResponse(responseCode = "401", description = "Unauthorized")
    public Response me() {
        if (securityIdentity.isAnonymous()) {
            LOG.warn("Anonymous call to /me");
            return Response.status(401).entity(Map.of("error", "Not authenticated")).build();
        }
        
        String userId = securityIdentity.getPrincipal().getName();
        String persona = securityIdentity.getAttribute("persona");
        if (persona == null) persona = "NONE";

        return Response.ok(Map.of(
                "authenticated", true,
                "userId", userId,
                "groups", securityIdentity.getRoles(),
                "persona", persona)).build();
    }

    @GET
    @Path("/providers")
    @PermitAll
    @Operation(summary = "List identity providers", description = "Returns a list of all supported 3rd-party identity providers")
    public Response listProviders() {
        LOG.info("Listing identity providers. Total registered: " + providers.stream().count());
        List<Map<String, String>> providerList = providers.stream()
                .peek(p -> LOG.info("Found provider: " + p.getId() + " (" + p.getName() + ")"))
                .map(p -> Map.of(
                        "id", p.getId(),
                        "name", p.getName(),
                        "type", p.getType()))
                .collect(Collectors.toList());
        return Response.ok(providerList).build();
    }

    @GET
    @Path("/config")
    @PermitAll
    @Operation(summary = "Get Auth Configuration", description = "Returns public OIDC configuration for the frontend")
    public Response getConfig() {
        String authServerUrl = System.getenv("OIDC_AUTH_SERVER_URL");
        String clientId = System.getenv("OIDC_CLIENT_ID");
        String mockAuth = System.getenv("MOCK_AUTH_ENABLED");
        boolean isMock = "true".equals(mockAuth) || authServerUrl == null || authServerUrl.isEmpty() || "mock".equals(authServerUrl);

        if (isMock && (authServerUrl == null || authServerUrl.isEmpty() || "mock".equals(authServerUrl))) {
            return Response.ok(Map.of(
                    "authServerUrl", "http://localhost:8080/realms/quarkus",
                    "clientId", "quarkus-app",
                    "isMock", true,
                    "discoveryEnabled", true)).build();
        }

        return Response.ok(Map.of(
                "authServerUrl", authServerUrl != null ? authServerUrl : "",
                "clientId", clientId != null ? clientId : "",
                "isMock", isMock,
                "discoveryEnabled", true)).build();
    }

    @GET
    @Path("/personas")
    @RolesAllowed({"ADMIN", "SECURITY_ADMIN", "STANDARD_USER", "REQUESTER"}) // Allow all authenticated users
    @Operation(summary = "List Personas", description = "Returns available personas for mapping")
    public Response listPersonas() {
        List<Map<String, String>> personas = List.of(
            Map.of("id", "ADMIN", "name", "Admin"),
            Map.of("id", "APPROVER", "name", "Approver"),
            Map.of("id", "REQUESTER", "name", "Requester"),
            Map.of("id", "AUDITOR", "name", "Auditor"),
            Map.of("id", "GOVERNANCE_ADMIN", "name", "Governance Admin"),
            Map.of("id", "SECURITY_ADMIN", "name", "Security Admin"),
            Map.of("id", "NONE", "name", "None")
        );
        return Response.ok(personas).build();
    }

    @PUT
    @Path("/users/{userId}/persona")
    @RolesAllowed({"ADMIN", "SECURITY_ADMIN"})
    @Operation(summary = "Update User Persona", description = "Updates the persona mapping for a specific user")
    @Consumes({MediaType.TEXT_PLAIN, MediaType.APPLICATION_JSON})
    public Response updateUserPersona(@PathParam("userId") String userId, String persona) {
        LOG.info("Updating persona for user: " + userId + " to " + persona);
        try {
            userService.updateUserPersona(userId, persona);
            return Response.ok().build();
        } catch (IllegalArgumentException e) {
            return Response.status(404).entity(Map.of("error", e.getMessage())).build();
        }
    }

    @PUT
    @Path("/groups/{groupId}/persona")
    @RolesAllowed({"ADMIN", "SECURITY_ADMIN"})
    @Operation(summary = "Update Group Persona", description = "Updates the persona mapping for a specific group")
    @Consumes({MediaType.TEXT_PLAIN, MediaType.APPLICATION_JSON})
    public Response updateGroupPersona(@PathParam("groupId") String groupId, String persona) {
        LOG.info("Updating persona for group: " + groupId + " to " + persona);
        try {
            userService.updateGroupPersona(groupId, persona);
            return Response.ok().build();
        } catch (IllegalArgumentException e) {
            return Response.status(404).entity(Map.of("error", e.getMessage())).build();
        }
    }
}
