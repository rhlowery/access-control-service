package com.rhlowery.acs.dto;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/**
 * Data transfer object for policy application requests.
 */
@Schema(name = "PolicyRequest", description = "Parameters for applying a security policy to a catalog node")
public class PolicyRequest {

    @Schema(description = "The path of the node within the catalog", example = "/data/sensitive_table", required = true)
    public String path;

    @Schema(description = "The action to authorize/deny (e.g., READ, WRITE, ADMIN)", example = "READ", required = true)
    public String action;

    @Schema(description = "The principal (user or group) to whom the policy applies", example = "finance-team", required = true)
    public String principal;

    public PolicyRequest() {}
}
