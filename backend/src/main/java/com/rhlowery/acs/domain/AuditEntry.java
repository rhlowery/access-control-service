package com.rhlowery.acs.domain;

import java.util.Map;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

/**
 * Record representing an entry in the audit log.
 */
@Schema(name = "AuditEntry", description = "A single documented action or event with security/compliance significance")
public record AuditEntry(
    @Schema(description = "Unique ID of the audit entry", examples = {"ev-88219"})
    String id,
    @Schema(description = "The category of the event", examples = {"ACCESS_DENIED"})
    String type,
    @Schema(description = "The client application or system that reported the event", examples = {"acs-ui"})
    String actor,
    @Schema(description = "Identity of the user involved in the event", examples = {"john_doe"})
    String userId,
    @Schema(description = "When the event occurred on the client side (epoch ms)", examples = {"1713093600000"})
    Long timestamp,
    @Schema(description = "When the event was processed by the server (epoch ms)", examples = {"1713093600100"})
    Long serverTimestamp,
    @Schema(description = "Contextual data for the event (e.g., path, resource, error)", examples = {"{\"path\": \"/data\", \"action\": \"DENY\"}"})
    Map<String, Object> details,
    @Schema(description = "Security signature verifying the integrity of this log entry", examples = {"base64-encoded-signature"})
    String signature,
    @Schema(description = "The ID of the server/service that signed this log entry", examples = {"acs-core-01"})
    String signer
) {}
