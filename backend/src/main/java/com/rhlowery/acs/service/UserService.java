package com.rhlowery.acs.service;

import com.rhlowery.acs.domain.User;
import com.rhlowery.acs.domain.Group;
import java.util.List;
import java.util.Optional;

/**
 * Interface for user and group management, providing CRUD operations and persona assignments.
 */
public interface UserService {
  /**
   * Retrieves all user profiles currently managed by the system.
   *
   * @return List of all users.
   */
  List<User> listUsers();

  /**
   * Retrieves all defined groups and their associated metadata.
   *
   * @return List of all groups.
   */
  List<Group> listGroups();

  /**
   * Retrieves a specific user by their unique identifier (email or username).
   *
   * @param userId The unique identifier of the user
   * @return Optional containing the user if found, empty otherwise
   */
  Optional<User> getUser(String userId);

  /**
   * Retrieves a specific group by its unique identifier.
   *
   * @param groupId The unique identifier of the group
   * @return Optional containing the group if found, empty otherwise
   */
  Optional<Group> getGroup(String groupId);

  /**
   * Updates the list of associated groups for a specific user.
   *
   * @param userId The unique identifier of the user
   * @param groups List of new group IDs to assign
   * @return The updated User object
   */
  User updateUserGroups(String userId, List<String> groups);

  /**
   * Assigns or updates the system-wide persona for a specific user.
   *
   * @param userId The unique identifier of the user
   * @param persona The persona ID to assign
   * @return The updated User object
   */
  User updateUserPersona(String userId, String persona);

  /**
   * Assigns or updates the system-wide persona for a specific group.
   *
   * @param groupId The unique identifier of the group
   * @param persona The persona ID to assign
   * @return The updated Group object
   */
  Group updateGroupPersona(String groupId, String persona);

  /**
   * Persists or updates a user profile.
   *
   * @param user The user object to save
   * @return The saved User object
   */
  User saveUser(User user);

  /**
   * Persists or updates a group profile.
   *
   * @param group The group object to save
   * @return The saved Group object
   */
  Group saveGroup(Group group);

  /**
   * Resets the user and group store (primarily for testing).
   */
  void clear();
}

