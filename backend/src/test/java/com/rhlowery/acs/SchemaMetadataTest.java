package com.rhlowery.acs;

import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.junit.jupiter.api.Test;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.fail;

/**
 * Unit test to verify OpenAPI schema metadata compliance.
 * Identified classes should use 'examples' array instead of deprecated 'example' field.
 */
public class SchemaMetadataTest {

    private static final String[] PACKAGES_TO_SCAN = {
        "com.rhlowery.acs.domain",
        "com.rhlowery.acs.dto"
    };

    @Test
    public void verifyNoDeprecatedSchemaExampleUsage() throws Exception {
        List<String> violations = new ArrayList<>();

        for (String packageName : PACKAGES_TO_SCAN) {
            List<Class<?>> classes = getClasses(packageName);
            for (Class<?> clazz : classes) {
                // Check class-level @Schema
                if (clazz.isAnnotationPresent(Schema.class)) {
                    Schema schema = clazz.getAnnotation(Schema.class);
                    if (!schema.example().isEmpty()) {
                        violations.add("Class " + clazz.getName() + " uses deprecated 'example' in @Schema");
                    }
                }

                // Check field-level @Schema
                for (Field field : clazz.getDeclaredFields()) {
                    if (field.isAnnotationPresent(Schema.class)) {
                        Schema schema = field.getAnnotation(Schema.class);
                        if (!schema.example().isEmpty()) {
                            violations.add("Field " + clazz.getSimpleName() + "." + field.getName() + " uses deprecated 'example' in @Schema");
                        }
                    }
                }
            }
        }

        if (!violations.isEmpty()) {
            StringBuilder sb = new StringBuilder("Found @Schema(example = ...) violations:\n");
            violations.forEach(v -> sb.append("- ").append(v).append("\n"));
            fail(sb.toString());
        }
    }

    /**
     * Simplified class discovery for the purpose of the test.
     * In a real system, choosing a library like Reflections or ClassGraph is preferred.
     */
    private List<Class<?>> getClasses(String packageName) throws Exception {
        List<Class<?>> classes = new ArrayList<>();
        // For simplicity in this environment, we list the classes we know exist from the audit.
        // A more dynamic scan would involve walking the file system.
        if (packageName.equals("com.rhlowery.acs.domain")) {
            classes.add(Class.forName("com.rhlowery.acs.domain.AccessRequest"));
            classes.add(Class.forName("com.rhlowery.acs.domain.AuditEntry"));
            classes.add(Class.forName("com.rhlowery.acs.domain.Group"));
            classes.add(Class.forName("com.rhlowery.acs.domain.User"));
            classes.add(Class.forName("com.rhlowery.acs.domain.SqlRequest"));
        } else if (packageName.equals("com.rhlowery.acs.dto")) {
            classes.add(Class.forName("com.rhlowery.acs.dto.CatalogRegistration"));
            classes.add(Class.forName("com.rhlowery.acs.dto.LoginRequest"));
            classes.add(Class.forName("com.rhlowery.acs.dto.PolicyRequest"));
        }
        return classes;
    }
}
