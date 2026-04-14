package com.rhlowery.acs.service;

import com.rhlowery.acs.domain.AccessRequest;
import com.rhlowery.acs.domain.User;
import com.rhlowery.acs.service.AccessRequestService;
import com.rhlowery.acs.service.UserService;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class ServiceCoverageTest {

    @Inject
    AccessRequestService accessRequestService;

    @Inject
    UserService userService;

    @Test
    public void testUserServiceBranches() {
        String userId = "test-service-user";
        // clear branch
        userService.clear();
        
        // saveUser branch
        User user = new User(userId, "Test Service User", "test@example.com", "STANDARD_USER", List.of(), "ADMIN");
        userService.saveUser(user);
        
        // getUser branch found
        Optional<User> found = userService.getUser(userId);
        assertTrue(found.isPresent());
        
        // listUsers branch
        List<User> users = userService.listUsers();
        assertFalse(users.isEmpty());
        
        // updateUserPersona branch
        userService.updateUserPersona(userId, "DATA_SCIENTIST");
        found = userService.getUser(userId);
        assertEquals("DATA_SCIENTIST", found.get().persona());
        
        // updateUserGroups branch
        userService.updateUserGroups(userId, List.of("group1"));
        found = userService.getUser(userId);
        assertTrue(found.get().groups().contains("group1"));
    }

    @Test
    public void testAccessRequestServiceBranches() {
        String requestId = "req-service-1";
        String userId = "user-service-1";
        
        // clear branch
        accessRequestService.clear();
        
        // saveRequests NEW branch
        AccessRequest req = new AccessRequest(requestId, userId, userId, "USER", "cat", "sch", "tab", "TABLE", List.of("READ"), "PENDING", 0L, 0L, "test", null, List.of("approver-group"), null, null);
        accessRequestService.saveRequests(List.of(req), userId, List.of(), false);
        
        // getRequestById branch found
        Optional<AccessRequest> found = accessRequestService.getRequestById(requestId);
        assertTrue(found.isPresent());
        
        // getAllRequests branches
        // isAdmin branch
        List<AccessRequest> all = accessRequestService.getAllRequests(userId, List.of(), true);
        assertFalse(all.isEmpty());
        
        // isOwner branch
        all = accessRequestService.getAllRequests(userId, List.of(), false);
        assertFalse(all.isEmpty());
        
        // isApprover branch
        all = accessRequestService.getAllRequests("other-user", List.of("approver-group"), false);
        assertFalse(all.isEmpty());
        
        // saveRequests UPDATE branch (as owner)
        AccessRequest update = new AccessRequest(requestId, userId, userId, "USER", "cat", "sch", "tab", "TABLE", List.of("READ"), "APPROVED", 0L, 0L, "update", null, List.of("approver-group"), null, null);
        accessRequestService.saveRequests(List.of(update), userId, List.of(), false);
        
        // saveRequests UPDATE branch (as admin)
        accessRequestService.saveRequests(List.of(update), "admin", List.of(), true);
        
        // saveRequests FORBIDDEN branch
        assertThrows(RuntimeException.class, () -> accessRequestService.saveRequests(List.of(update), "intruder", List.of(), false));
    }
}
