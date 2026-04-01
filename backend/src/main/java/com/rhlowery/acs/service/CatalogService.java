package com.rhlowery.acs.service;

import java.util.List;

/**
 * Orchestrates operations across multiple data catalog providers (e.g., Unity Catalog, AWS Glue).
 *
 * <pre>
 * {@code
 * @startuml
 * interface CatalogService {
 *   +applyPolicy(catalogId, path, action, principal)
 *   +getEffectivePermissions(catalogId, path, principal)
 *   +getNodes(catalogId, path)
 *   +getRequiredApprovers(catalogId, path)
 * }
 * CatalogService "1" o-- "0..*" CatalogProvider : orchestrates
 * @enduml
 * }
 * </pre>
 */
public interface CatalogService {
  /**
   * Applies a security policy to a specific resource path within a catalog.
   *
   * @param catalogId Unique identifier of the catalog
   * @param path The resource path (e.g., catalog.schema.table)
   * @param action The privilege to grant (e.g., SELECT, MODIFY)
   * @param principal The identity receiving the privilege
   */
  void applyPolicy(String catalogId, String path, String action, String principal);

  /**
   * Retrieves the effective permissions for a principal on a specific resource.
   *
   * @param catalogId Unique identifier of the catalog
   * @param path The resource path
   * @param principal The user or group identity
   * @return The highest effective permission string
   */
  String getEffectivePermissions(String catalogId, String path, String principal);

  /**
   * Lists all registered catalog providers and their capabilities.
   *
   * @return A list of provider description strings
   */
  List<String> listProviders();

  /**
   * Verifies if a specific policy is correctly applied at the provider level.
   * Used for drift detection.
   *
   * @param catalogId Unique identifier of the catalog
   * @param path The resource path
   * @param expectedAction The expected privilege
   * @param principal The identity to check
   * @return true if the policy is correctly applied, false otherwise
   */
  boolean verifyPolicy(String catalogId, String path, String expectedAction, String principal);

  /**
   * Retrieves child nodes for a given path in a specific catalog.
   *
   * @param catalogId Unique identifier of the catalog
   * @param path The parent path
   * @return List of child CatalogNode objects
   */
  List<com.rhlowery.acs.domain.CatalogNode> getNodes(String catalogId, String path);

  /**
   * Returns metadata about all registered providers.
   *
   * @return List of CatalogRegistration DTOs
   */
  List<com.rhlowery.acs.dto.CatalogRegistration> getProviderRegistrations();

  /**
   * Dynamically registers a new catalog provider.
   *
   * @param provider The provider implementation to register
   */
  void registerProvider(CatalogProvider provider);

  /**
   * Recursively resolves the required approver groups for a given resource path
   * by traversing up the catalog hierarchy.
   *
   * @param catalogId Unique identifier of the catalog
   * @param path The resource path
   * @return List of group IDs that must approve access
   */
  List<String> getRequiredApprovers(String catalogId, String path);

  /**
   * Resets all provider states (primarily for testing).
   */
  void clear();
}
