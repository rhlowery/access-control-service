package com.rhlowery.acs.service;

import com.rhlowery.acs.domain.CatalogNode;
import java.util.List;

/**
 * Interface for catalog metadata providers. Defines methods for hierarchical
 * discovery of databases, tables, and other resources, as well as policy
 * application and verification.
 *
 * [PlantUML: Catalog Metadata Discovery hierarchy and policy application methods]
 */
public interface CatalogProvider {
  /**
   * Returns the unique identifier for this catalog.
   *
   * @return Unique catalog ID
   */
  String getCatalogId();

  /**
   * Returns a human-readable name for the provider.
   *
   * @return Provider name
   */
  default String getProviderName() {
    return getCatalogId();
  }

  /**
   * Returns a map of capabilities and metadata for this provider.
   *
   * @return Capability map
   */
  default java.util.Map<String, String> getCapabilities() {
    return java.util.Collections.emptyMap();
  }

  /**
   * Discovers children nodes of a given resource path.
   *
   * @param path The parent resource path (e.g., /main/default)
   * @return List of child nodes
   */
  List<CatalogNode> getChildren(String path);

  /**
   * Retrieves metadata for a specific resource path.
   *
   * @param path The resource path
   * @return The node metadata
   */
  CatalogNode getNode(String path);

  /**
   * Applies an access policy to a resource.
   *
   * @param path The target resource path
   * @param action The privilege to grant (e.g., SELECT, OWNERSHIP)
   * @param principal The user or group to grant it to
   */
  void applyPolicy(String path, String action, String principal);

  /**
   * Retrieves effective permissions for a user on a given path.
   *
   * @param path The resource path
   * @param principal The user identifier
   * @return The privilege string
   */
  String getEffectivePermissions(String path, String principal);
}
