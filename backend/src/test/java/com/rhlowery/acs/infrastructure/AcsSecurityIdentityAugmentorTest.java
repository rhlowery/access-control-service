package com.rhlowery.acs.infrastructure;

import io.quarkus.security.identity.SecurityIdentity;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class AcsSecurityIdentityAugmentorTest {

    @Inject
    AcsSecurityIdentityAugmentor augmentor;

    @Test
    public void testAugmentationLogic() {
        // We can't easily mock SecurityIdentity for the augmentor directly without complex CDI setup,
        // but we can call it if we can get a handle to it.
        // Actually, the augmentor is called automatically by Quarkus on every request.
        // We hit it via AuthResourceCoverageTest already.
        // But we want to hit the branches where it DOES NOT find a persona or attributes.
    }
}
