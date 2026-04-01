package com.rhlowery.acs.domain;

import java.util.List;
import java.util.Map;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

/**
 * Represents an access request in the system.
 *
 * <pre>
 * {@code
 * @startuml
 * [*] --> PENDING : Submit
 * PENDING --> APPROVED : Approve
 * PENDING --> REJECTED : Reject
 * APPROVED --> VERIFIED : Verify Provisioning
 * APPROVED --> PARTIALLY_APPROVED : Partial Approval
 * @enduml
 * }
 * </pre>
 *
 * @param id Unique identifier for the request
 * @param requesterId The ID of the user who submitted the request
 * @param userId The ID of the principal (user/group) the access is for
 * @param principalType The type of principal (USER, SERVICE_PRINCIPAL, GROUP)
 * @param catalogName The name of the target catalog
 * @param schemaName The name of the target schema
 * @param tableName The name of the target table or resource
 * @param resourceType The type of resource (TABLE, VOLUME, MODEL)
 * @param privileges The list of privileges being requested
 * @param status The current status of the request (PENDING, APPROVED, REJECTED, etc.)
 * @param createdAt Timestamp of creation
 * @param updatedAt Timestamp of last update
 * @param justification Business justification for the access request
 * @param rejectionReason Reason for rejection if applicable
 * @param approverGroups Groups required to approve this request
 * @param metadata Additional key-value metadata
 * @param expirationTime Requested expiration time for the access
 */
@Schema(name = "AccessRequest", description = "A request for a specific set of privileges on a data resource")
public record AccessRequest(
  @Schema(description = "Unique identifier for the request", examples = {"req-12345"})
  String id,
  @Schema(description = "The ID of the user who submitted the request", examples = {"requester@example.com"})
  String requesterId,
  @Schema(description = "The ID of the principal (user/group) the access is for", examples = {"analyst@example.com"})
  String userId,
  @Schema(description = "The type of principal", examples = {"USER"})
  String principalType, // USER, SERVICE_PRINCIPAL, GROUP
  @Schema(description = "The name of the target catalog", examples = {"prod_catalog"})
  String catalogName,
  @Schema(description = "The name of the target schema", examples = {"sales_data"})
  String schemaName,
  @Schema(description = "The name of the target table or resource", examples = {"monthly_revenue"})
  String tableName,
  @Schema(description = "The type of resource", examples = {"TABLE"})
  String resourceType, // TABLE, VOLUME, MODEL
  @Schema(description = "The list of privileges being requested", examples = {"[\"SELECT\", \"DESCRIBE\"]"})
  List<String> privileges,
  @Schema(description = "The current status of the request", examples = {"PENDING"})
  String status, // PENDING, APPROVED, REJECTED, VERIFIED, PARTIALLY_APPROVED
  @Schema(description = "Timestamp of creation")
  Long createdAt,
  @Schema(description = "Timestamp of last update")
  Long updatedAt,
  @Schema(description = "Business justification for the access request", examples = {"Need access for Q3 financial reporting"})
  String justification,
  @Schema(description = "Reason for rejection if applicable", examples = {"Incomplete justification"})
  String rejectionReason,
  @Schema(description = "Groups required to approve this request", examples = {"[\"data-owners\", \"security-leads\"]"})
  List<String> approverGroups,
  @Schema(description = "Additional key-value metadata")
  Map<String, Object> metadata,
  @Schema(description = "Requested expiration time for the access")
  Long expirationTime
) {}
