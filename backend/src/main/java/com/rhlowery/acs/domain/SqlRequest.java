package com.rhlowery.acs.domain;

import org.eclipse.microprofile.openapi.annotations.media.Schema;
import io.quarkus.runtime.annotations.RegisterForReflection;
import java.util.Map;

/**
 * Record representing a SQL execution request.
 */
@RegisterForReflection
@Schema(name = "SqlRequest", description = "A request to execute a SQL statement on a target warehouse")
public record SqlRequest(
    @Schema(description = "The SQL statement to execute", examples = {"SELECT * FROM sales LIMIT 10"}, required = true)
    String statement,
    @Schema(description = "Optional parameters for the SQL statement")
    Map<String, Object> parameters
) {}
