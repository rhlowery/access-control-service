package com.rhlowery.acs.service.impl;

import jakarta.enterprise.context.ApplicationScoped;

/**
 * Mock implementation of a {@link CatalogProvider} for DataHub.
 */
@ApplicationScoped
public class DataHubNodeProvider extends AbstractMockProvider {
  public DataHubNodeProvider() {
    super("datahub", "DataHubNodeProvider");
  }
}
