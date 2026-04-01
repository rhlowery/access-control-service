package com.rhlowery.acs.resource;

import com.rhlowery.acs.dto.PolicyRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Map;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

/**
 * REST resource for interacting with data catalogs.
 * Provides endpoints for node traversal, permission checks, and policy application.
 */
@jakarta.enterprise.context.ApplicationScoped
@Path("/api/catalog")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Catalog", description = "Endpoints for traversing data catalogs and managing nodes")
public class CatalogResource {

  @jakarta.inject.Inject
  com.rhlowery.acs.service.CatalogService catalogService;

  /**
   * Retrieves child nodes for a specific path within a catalog.
   *
   * @param catalogId Unique identifier of the catalog
   * @param path The resource path
   * @return Response containing a list of child nodes
   */
  @GET
  @Path("/{catalogId}/nodes")
  @Operation(summary = "Get children of a catalog node", description = "Returns a list of nodes under the given path for a specific catalog")
  @APIResponse(responseCode = "200", description = "List of children", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = List.class)))
  @APIResponse(responseCode = "404", description = "Catalog not found")
  public Response getNodes(@Parameter(description = "ID of the catalog to query", required = true) @PathParam("catalogId") String catalogId,
                           @Parameter(description = "Path to the node within the catalog", required = false) @QueryParam("path") String path) {
    try {
      return Response.ok(((com.rhlowery.acs.service.impl.DefaultCatalogService) catalogService).getNodes(catalogId, path)).build();
    } catch (Exception e) {
      return Response.status(404).entity(Map.of("error", e.getMessage())).build();
    }
  }

  /**
   * Verifies the existence and accessibility of a catalog node.
   *
   * @param catalogId Unique identifier of the catalog
   * @param path The resource path
   * @return Response 200 if verified, 404 otherwise
   */
  @GET
  @Path("/{catalogId}/nodes/verify")
  @Operation(summary = "Verify a catalog node", description = "Performs a simple mock verification of a given catalog node path.")
  @APIResponse(responseCode = "200", description = "Node verification successful")
  @APIResponse(responseCode = "404", description = "Catalog not found")
  public Response verifyNode(@Parameter(description = "ID of the catalog", required = true) @PathParam("catalogId") String catalogId,
                             @Parameter(description = "Path to the node to verify", required = true) @QueryParam("path") String path) {
    try {
      catalogService.getNodes(catalogId, path);
      return Response.ok().build();
    } catch (Exception e) {
      return Response.status(404).entity(Map.of("error", e.getMessage())).build();
    }
  }

  /**
   * Orchestrates the application of a security policy to a catalog resource.
   *
   * <pre>
   * {@code
   * @startuml
   * start
   * :Receive PolicyRequest;
   * :Extract parameters;
   * :Identify Service Provider;
   * if (Provider Found?) then (yes)
   *   :Apply Policy to Provider;
   *   :Return 202 Accepted;
   * else (no)
   *   :Return 404 Not Found;
   * endif
   * stop
   * @enduml
   * }
   * </pre>
   *
   * @param catalogId Unique identifier of the catalog
   * @param request The policy details (path, action, principal)
   * @return Response 202 if accepted
   */
  @POST
  @Path("/{catalogId}/nodes/policy")
  @Operation(summary = "Apply policy to a node", description = "Applies a security or audit policy to the specified catalog node")
  @APIResponse(responseCode = "202", description = "Policy application accepted")
  @APIResponse(responseCode = "404", description = "Catalog not found")
  public Response applyPolicy(@Parameter(description = "ID of the catalog", required = true) @PathParam("catalogId") String catalogId,
                              PolicyRequest request) {

    String path = request.path;
    String action = request.action;
    String principal = request.principal;

    try {
      catalogService.applyPolicy(catalogId, path, action, principal);
      return Response.accepted().build();
    } catch (Exception e) {
      return Response.status(404).entity(Map.of("error", e.getMessage())).build();
    }
  }

  /**
   * Retrieves effective permissions for a user on a resource.
   *
   * @param catalogId Unique identifier of the catalog
   * @param path The resource path
   * @param principal The user or group identifier
   * @return Response containing effective permissions
   */
  @GET
  @Path("/{catalogId}/nodes/permissions")
  @Operation(summary = "Get effective permissions", description = "Calculates and returns the effective permissions for a principal on a node")
  @APIResponse(responseCode = "200", description = "Effective permissions for the node", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = Map.class), examples = @org.eclipse.microprofile.openapi.annotations.media.ExampleObject(value = "{\"effective\": \"READ\"}")))
  @APIResponse(responseCode = "404", description = "Catalog not found")
  public Response getPermissions(@Parameter(description = "ID of the catalog", required = true) @PathParam("catalogId") String catalogId,
                                 @Parameter(description = "Path to the node", required = true) @QueryParam("path") String path,
                                 @Parameter(description = "Principal for whom to get permissions", required = false) @QueryParam("principal") String principal) {
    try {
      String perm = catalogService.getEffectivePermissions(catalogId, path, principal != null ? principal : "admin");
      return Response.ok(Map.of("effective", perm)).build();
    } catch (Exception e) {
      return Response.status(404).entity(Map.of("error", e.getMessage())).build();
    }
  }

  /**
   * Simple search endpoint across all registered catalogs.
   *
   * @param q Short query string
   * @param query Full query string
   * @return Response containing search results
   */
  @GET
  @Path("/search")
  public Response searchCatalog(@QueryParam("q") String q, @QueryParam("query") String query) {
    // Simulating search across providers
    List<Map<String, Object>> results = List.of(
      Map.of("name", "sensitive_table", "type", "TABLE")
    );
    return Response.ok(Map.of("results", results)).build();
  }

  /**
   * Lists all available catalog provider configurations.
   *
   * @return Response containing provider list
   */
  @GET
  @Path("/providers")
  public Response listProviders() {
    return Response.ok(catalogService.listProviders()).build();
  }
}
