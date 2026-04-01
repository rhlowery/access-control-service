package com.rhlowery.acs.service.impl;

import com.rhlowery.acs.service.CatalogProvider;
import com.rhlowery.acs.service.CatalogService;
import java.util.List;
import java.util.stream.Collectors;
import org.jboss.logging.Logger;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DefaultCatalogService implements CatalogService {
    private static final Logger LOG = Logger.getLogger(DefaultCatalogService.class);
    
    @jakarta.inject.Inject
    jakarta.enterprise.inject.Instance<CatalogProvider> providersInstance;

    private final List<CatalogProvider> providers = new java.util.concurrent.CopyOnWriteArrayList<>();

    @jakarta.annotation.PostConstruct
    void init() {
        providersInstance.stream().forEach(providers::add);
    }

    public void registerProvider(CatalogProvider provider) {
        LOG.infof("Dynamically registering provider: %s", provider.getCatalogId());
        providers.add(provider);
    }

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

    @Override
    public String getEffectivePermissions(String catalogId, String path, String principal) {
        CatalogProvider provider = findProvider(catalogId);
        if (provider != null) {
            return provider.getEffectivePermissions(path, principal);
        }
        throw new RuntimeException("Catalog not found: " + catalogId);
    }

    @Override
    public List<String> listProviders() {
        return providers.stream()
            .map(p -> String.format("%s (%s) - %s", p.getProviderName(), p.getCatalogId(), p.getClass().getName()))
            .collect(Collectors.toList());
    }

    @Override
    public List<com.rhlowery.acs.dto.CatalogRegistration> getProviderRegistrations() {
        return providers.stream()
            .map(p -> {
                com.rhlowery.acs.dto.CatalogRegistration reg = new com.rhlowery.acs.dto.CatalogRegistration();
                reg.id = p.getCatalogId();
                reg.name = p.getProviderName();
                reg.type = p.getCapabilities().getOrDefault("type", "unknown");
                reg.settings = new java.util.HashMap<>(p.getCapabilities());
                return reg;
            })
            .collect(Collectors.toList());
    }

    @Override
    public List<com.rhlowery.acs.domain.CatalogNode> getNodes(String catalogId, String path) {
        CatalogProvider provider = findProvider(catalogId);
        if (provider == null) throw new RuntimeException("Catalog not found: " + catalogId);
        return provider.getChildren(path);
    }

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

    private String getParentPath(String path) {
        if (path == null || path.equals("/") || !path.contains("/")) return null;
        int lastSlash = path.lastIndexOf('/');
        if (lastSlash == 0) return "/";
        return path.substring(0, lastSlash);
    }

    @Override
    public void clear() {
        for (CatalogProvider provider : providers) {
            if (provider instanceof com.rhlowery.acs.service.impl.AbstractMockProvider) {
                ((com.rhlowery.acs.service.impl.AbstractMockProvider) provider).clear();
            }
        }
    }

    private CatalogProvider findProvider(String id) {
        return providers.stream()
            .filter(p -> id.equals(p.getCatalogId()))
            .findFirst()
            .orElse(null);
    }
}
