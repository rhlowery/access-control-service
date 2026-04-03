package com.rhlowery.acs.service.impl;

import com.rhlowery.acs.dto.CatalogRegistration;
import com.rhlowery.acs.service.CatalogProvider;
import com.rhlowery.acs.service.CatalogService;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;
import org.jboss.logging.Logger;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;
import jakarta.annotation.PostConstruct;

/**
 * Default implementation of the {@link CatalogService}.
 * Orchestrates metadata discovery and policy application across multiple 
 * {@link CatalogProvider} implementations.
 *
 * <pre>
 * [PlantUML: Provider registration and orchestration sequence]
 * </pre>
 */
@ApplicationScoped
public class DefaultCatalogService implements CatalogService {
  private static final Logger LOG = Logger.getLogger(DefaultCatalogService.class);

  @Inject
  Instance<CatalogProvider> providersInstance;

  private final List<CatalogProvider> providers = new java.util.concurrent.CopyOnWriteArrayList<>();

  /**
   * Automatically initializes the service by collecting all CDI-managed 
   * {@link CatalogProvider} instances.
   */
  @PostConstruct
  void init() {
    providersInstance.stream().forEach(providers::add);
  }

  /**
   * Manually registers a new catalog provider.
   *
   * @param provider The provider implementation to register
   */
  @Override
  public void registerProvider(CatalogProvider provider) {
    LOG.infof("Dynamically registering provider: %s", provider.getCatalogId());
    providers.add(provider);
  }

  /**
   * Applies an access policy to a specific resource path in a catalog.
   *
   * @param catalogId The ID of the target catalog
   * @param path The resource path (e.g. catalog.schema.table)
   * @param action The action to permit (e.g. SELECT, UPDATE)
   * @param principal The user or group receiving the permission
   * @throws RuntimeException if the provider for catalogId is not found
   */
  @Override
  public void applyPolicy(String catalogId, String path, String action, String principal) {
    CatalogProvider provider = findProvider(catalogId);
    if (provider != null) {
      LOG.infof("Orchestrating policy apply: catalog=%s path=%s action=%s principal=%s", catalogId, path, action, principal);
      provider.applyPolicy(path, action, principal);
    } else {
      throw new RuntimeException("Catalog provider not found: " + catalogId);
    }
  }

  /**
   * Retrieves the effective permissions for a user on a specific resource.
   *
   * @param catalogId The ID of the target catalog
   * @param path The resource path
   * @param principal The user identifier
   * @return The permission string (e.g. READ, WRITE, NONE)
   * @throws RuntimeException if the provider for catalogId is not found
   */
  @Override
  public String getEffectivePermissions(String catalogId, String path, String principal) {
    CatalogProvider provider = findProvider(catalogId);
    if (provider != null) {
      return provider.getEffectivePermissions(path, principal);
    }
    throw new RuntimeException("Catalog not found: " + catalogId);
  }

  /**
   * Lists all registered catalog providers with their implementation details.
   *
   * @return A list of descriptive strings for each provider
   */
  @Override
  public List<String> listProviders() {
    return providers.stream()
      .map(p -> String.format("%s (%s) - %s", p.getProviderName(), p.getCatalogId(), p.getClass().getName()))
      .collect(Collectors.toList());
  }

  /**
   * Retrieves structured registration metadata for all providers.
   *
   * @return A list of {@link CatalogRegistration} DTOs
   */
  @Override
  public List<CatalogRegistration> getProviderRegistrations() {
    return providers.stream()
      .map(p -> {
        CatalogRegistration reg = new CatalogRegistration();
        reg.id = p.getCatalogId();
        reg.name = p.getProviderName();
        reg.type = p.getCapabilities().getOrDefault("type", "unknown");
        reg.settings = new HashMap<>(p.getCapabilities());
        return reg;
      })
      .collect(Collectors.toList());
  }

  /**
   * Discovers child nodes (e.g. schemas, tables) for a given path.
   *
   * @param catalogId The ID of the target catalog
   * @param path The parent path (empty string for root)
   * @return A list of {@link com.rhlowery.acs.domain.CatalogNode} objects
   * @throws RuntimeException if the provider for catalogId is not found
   */
  @Override
  public List<com.rhlowery.acs.domain.CatalogNode> getNodes(String catalogId, String path) {
    CatalogProvider provider = findProvider(catalogId);
    if (provider == null) throw new RuntimeException("Catalog not found: " + catalogId);
    return provider.getChildren(path);
  }

  /**
   * Verifies if an access policy is correctly applied in the target system.
   * Detects drift between ACS state and actual catalog state.
   *
   * @param catalogId The ID of the target catalog
   * @param path The resource path
   * @param expectedAction The action that should be permitted
   * @param principal The user identifier
   * @return true if the system reflects the expected policy, false otherwise
   */
  @Override
  public boolean verifyPolicy(String catalogId, String path, String expectedAction, String principal) {
    CatalogProvider provider = findProvider(catalogId);
    if (provider != null) {
      String actual = provider.getEffectivePermissions(path, principal);
      boolean match = expectedAction.equalsIgnoreCase(actual);
      if (!match) {
        LOG.warnf("DRIFT DETECTED: catalog=%s path=%s principal=%s expected=%s actual=%s",
          catalogId, path, principal, expectedAction, actual);
      }
      return match;
    }
    return false;
  }

  /**
   * Identifies the required approvers for a specific resource path.
   * Traverses up the hierarchy to find inherited approvers if not defined locally.
   *
   * @param catalogId The ID of the target catalog
   * @param path The resource path
   * @return A list of approver user/group IDs
   */
  @Override
  public List<String> getRequiredApprovers(String catalogId, String path) {
    CatalogProvider provider = findProvider(catalogId);
    if (provider == null) return java.util.Collections.emptyList();

    String currentPath = path;
    while (currentPath != null && !currentPath.isEmpty()) {
      com.rhlowery.acs.domain.CatalogNode node = provider.getNode(currentPath);
      if (node != null && node.approvers() != null && !node.approvers().isEmpty()) {
        return node.approvers();
      }
      currentPath = getParentPath(currentPath);
    }
    return java.util.Collections.emptyList();
  }

  /**
   * Calculates the parent path of a given resource path string.
   *
   * @param path The current resource path
   * @return The parent path, or null if at root
   */
  private String getParentPath(String path) {
    if (path == null || path.equals("/") || !path.contains("/")) return null;
    int lastSlash = path.lastIndexOf('/');
    if (lastSlash == 0) return "/";
    return path.substring(0, lastSlash);
  }

  @Override
  public void clear() {
    for (CatalogProvider provider : providers) {
      if (provider instanceof AbstractMockProvider) {
        ((AbstractMockProvider) provider).clear();
      }
    }
  }

  /**
   * Helper method to locate a specific catalog provider by ID.
   *
   * @param id The catalog identifier
   * @return The CatalogProvider if found, null otherwise
   */
  private CatalogProvider findProvider(String id) {
    return providers.stream()
      .filter(p -> id.equals(p.getCatalogId()))
      .findFirst()
      .orElse(null);
  }
}
