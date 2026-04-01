package com.rhlowery.acs.dto;

import org.eclipse.microprofile.openapi.annotations.media.Schema;
import java.util.Map;

/**
 * Data transfer object for catalog registrations.
 */
@Schema(name = "CatalogRegistration", description = "Metadata and settings for a catalog connection")
public class CatalogRegistration {

    @Schema(description = "The unique identifier for the catalog connection", examples = {"prod-uc"}, required = true)
    public String id;

    @Schema(description = "The display name of the catalog", examples = {"Production Unity Catalog"})
    public String name;

    @Schema(description = "The type of catalog (e.g., UNITY_CATALOG, GLUE, HIVE)", examples = {"UNITY_CATALOG"})
    public String type;

    @Schema(description = "Configuration settings for the catalog (e.g., host, port, token)")
    public Map<String, Object> settings;

    public CatalogRegistration() {}
}
