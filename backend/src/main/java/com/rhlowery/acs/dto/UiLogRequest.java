package com.rhlowery.acs.dto;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/**
 * Data transfer object for UI log events sent from the frontend.
 */
@Schema(name = "UiLogRequest", description = "A log message or error sent by the UI for server-side recording")
public class UiLogRequest {

    @Schema(description = "The log level (e.g., info, warn, error)", example = "error", required = true)
    public String level;

    @Schema(description = "The descriptive log message", example = "Failed to load identity providers", required = true)
    public String message;

    public UiLogRequest() {}
}
