package com.rhlowery.acs.service.impl;

import jakarta.enterprise.context.ApplicationScoped;

/**
 * Mock implementation of a {@link CatalogProvider} for Unity Catalog (OSS).
 */
@ApplicationScoped
public class UnityCatalogNodeProvider extends AbstractMockProvider {
  public UnityCatalogNodeProvider() {
    super("uc-oss", "UnityCatalogNodeProvider");
  }
}
