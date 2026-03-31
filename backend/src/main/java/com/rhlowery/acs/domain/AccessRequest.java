package com.rhlowery.acs.domain;

import java.util.List;
import java.util.Map;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

/**
 * Represents an access request in the system.
 */
@Schema(name = "AccessRequest", description = "A request for a specific set of privileges on a data resource")
public record AccessRequest(
    @Schema(description = "Unique identifier for the request", example = "req-12345")
    String id,
    @Schema(description = "The ID of the user who submitted the request", example = "requester@example.com")
    String requesterId,
    @Schema(description = "The ID of the principal (user/group) the access is for", example = "analyst@example.com")
    String userId,
    @Schema(description = "The type of principal", example = "USER")
    String principalType, // USER, SERVICE_PRINCIPAL, GROUP
    @Schema(description = "The name of the target catalog", example = "prod_catalog")
    String catalogName,
    @Schema(description = "The name of the target schema", example = "sales_data")
    String schemaName,
    @Schema(description = "The name of the target table or resource", example = "monthly_revenue")
    String tableName,
    @Schema(description = "The type of resource", example = "TABLE")
    String resourceType, // TABLE, VOLUME, MODEL
    @Schema(description = "The list of privileges being requested", example = "[\"SELECT\", \"DESCRIBE\"]")
    List<String> privileges,
    @Schema(description = "The current status of the request", example = "PENDING")
    String status, // PENDING, APPROVED, REJECTED, VERIFIED, PARTIALLY_APPROVED
    @Schema(description = "Timestamp of creation")
    Long createdAt,
    @Schema(description = "Timestamp of last update")
    Long updatedAt,
    @Schema(description = "Business justification for the access request", example = "Need access for Q3 financial reporting")
    String justification,
    @Schema(description = "Reason for rejection if applicable", example = "Incomplete justification")
    String rejectionReason,
    @Schema(description = "Groups required to approve this request", example = "[\"data-owners\", \"security-leads\"]")
    List<String> approverGroups,
    @Schema(description = "Additional key-value metadata")
    Map<String, Object> metadata,
    @Schema(description = "Requested expiration time for the access")
    Long expirationTime
) {}
