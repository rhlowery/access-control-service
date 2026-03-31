package com.rhlowery.acs.resource;

import com.rhlowery.acs.dto.CatalogRegistration;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

/**
 * REST Resource for dynamic catalog registration and management.
 */
@jakarta.enterprise.context.ApplicationScoped
@Path("/api/catalog/registrations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Catalog Registration", description = "Endpoints for managing dynamic catalog connections")
public class CatalogRegistrationResource {

    private static final Logger LOG = Logger.getLogger(CatalogRegistrationResource.class);
    private final Map<String, CatalogRegistration> registrations = new ConcurrentHashMap<>();

    @POST
    @Operation(summary = "Register a new catalog", description = "Adds a new catalog connection to the system")
    @APIResponse(responseCode = "201", description = "Catalog registered successfully")
    public Response registerCatalog(CatalogRegistration registration) {
        if (registration == null || registration.id == null) {
            return Response.status(400).entity(Map.of("error", "Missing id")).build();
        }
        LOG.infof("Registering catalog: %s", registration.id);
        registrations.put(registration.id, registration);
        return Response.status(201).entity(registration).build();
    }

    @GET
    @Operation(summary = "List registered catalogs", description = "Returns a list of all currently registered catalog connections")
    public Response listRegistrations() {
        return Response.ok(new ArrayList<>(registrations.values())).build();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get catalog details", description = "Returns details for a specific catalog registration")
    public Response getRegistration(@PathParam("id") String id) {
        CatalogRegistration registration = registrations.get(id);
        if (registration == null) return Response.status(404).build();
        return Response.ok(registration).build();
    }

    @PATCH
    @Path("/{id}")
    @Operation(summary = "Update catalog settings", description = "Partially updates the settings for an existing catalog registration")
    public Response updateRegistration(@PathParam("id") String id, CatalogRegistration update) {
        CatalogRegistration existing = registrations.get(id);
        if (existing == null) return Response.status(404).build();
        
        LOG.infof("Updating catalog: %s", id);
        
        if (update.name != null) existing.name = update.name;
        if (update.type != null) existing.type = update.type;
        if (update.settings != null) {
            if (existing.settings == null) {
                existing.settings = new java.util.HashMap<>();
            }
            existing.settings.putAll(update.settings);
        }
        
        return Response.ok(existing).build();
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Unregister a catalog", description = "Removes a catalog connection from the system")
    @APIResponse(responseCode = "204", description = "Deleted")
    public Response deleteRegistration(@PathParam("id") String id) {
        if (registrations.remove(id) == null) return Response.status(404).build();
        return Response.noContent().build();
    }
}
