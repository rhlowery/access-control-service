package com.rhlowery.acs.service;

import com.rhlowery.acs.domain.AccessRequest;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing the lifecycle of access requests, including submission,
 * approval orchestration, and status tracking.
 *
 * <pre>
 * {@code
 * @startuml
 * [*] --> PENDING : Submission
 * PENDING --> APPROVED : Admin Approval
 * PENDING --> REJECTED : Admin Rejection
 * APPROVED --> [*] : Provisioned
 * @enduml
 * }
 * </pre>
 */
public interface AccessRequestService {
  /**
   * Retrieves all access requests visible to the given user and their groups.
   *
   * @param userId The unique identifier of the user
   * @param groups The list of groups the user belongs to
   * @param isAdmin Whether the user has administrative privileges (can see all requests)
   * @return List of matching AccessRequest objects
   */
  List<AccessRequest> getAllRequests(String userId, List<String> groups, boolean isAdmin);

  /**
   * Persists or updates multiple access requests.
   *
   * @param requests The list of requests to save
   * @param userId The ID of the user performing the save
   * @param groups The groups of the user performing the save
   * @param isAdmin Whether the performing user is an admin
   */
  void saveRequests(List<AccessRequest> requests, String userId, List<String> groups, boolean isAdmin);

  /**
   * Retrieves a single access request by its unique identifier.
   *
   * @param id The unique identifier of the request
   * @return Optional containing the request if found, empty otherwise
   */
  Optional<AccessRequest> getRequestById(String id);

  /**
   * Resets the entire request store (primarily for testing).
   */
  void clear();
}
