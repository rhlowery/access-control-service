package com.rhlowery.acs.service;

import com.rhlowery.acs.domain.CatalogNode;
import java.util.List;

public interface CatalogProvider {
    String getCatalogId();

    default String getProviderName() {
        return getCatalogId();
    }

    default java.util.Map<String, String> getCapabilities() {
        return java.util.Collections.emptyMap();
    }

    List<CatalogNode> getChildren(String path);
    CatalogNode getNode(String path);
    void applyPolicy(String path, String action, String principal);
    String getEffectivePermissions(String path, String principal);
}
