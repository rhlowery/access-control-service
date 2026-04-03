package com.rhlowery.acs.service.impl;

import com.rhlowery.acs.domain.AuditEntry;
import com.rhlowery.acs.infrastructure.entity.AuditEntryEntity;
import com.rhlowery.acs.service.AuditService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.operators.multi.processors.BroadcastProcessor;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.jboss.logging.Logger;

/**
 * JPA-based implementation of the {@link AuditService}.
 * Handles persistent storage of audit entries and real-time broadcasting
 * of events using Mutiny {@link io.smallrye.mutiny.Multi}.
 */
@ApplicationScoped
public class DatabaseAuditService implements AuditService {
  private static final Logger LOG = Logger.getLogger(DatabaseAuditService.class);
  private final ObjectMapper mapper = new ObjectMapper();
  private final BroadcastProcessor<AuditEntry> processor = BroadcastProcessor.create();

  /**
   * Persists a new audit entry and broadcasts it to any active subscribers.
   *
   * @param entry The audit entry to record
   */
  @Override
  @jakarta.transaction.Transactional
  public void log(AuditEntry entry) {
    LOG.debug("Logging audit entry: " + entry.type() + " by " + entry.actor());
    String detailsStr = "";
    try {
      detailsStr = mapper.writeValueAsString(entry.details());
    } catch (Exception e) {
      LOG.error("Failed to serialize audit details", e);
    }

    AuditEntryEntity entity = new AuditEntryEntity(
      entry.id(), entry.type(), entry.actor(), entry.userId(), 
      entry.timestamp(), entry.serverTimestamp(), detailsStr, 
      entry.signature(), entry.signer()
    );
    entity.persist();
    processor.onNext(entry); // Broadcast to active streams
  }

  /**
   * Retrieves all historical audit logs from the database.
   *
   * @return A list of domain {@link AuditEntry} objects
   */
  @Override
  public List<AuditEntry> getLogs() {
    return AuditEntryEntity.<AuditEntryEntity>listAll().stream()
      .map(this::mapToDomain)
      .collect(Collectors.toList());
  }

  /**
   * Provides a live stream of audit events as they are recorded.
   *
   * @return A Multi stream of {@link AuditEntry} objects
   */
  @Override
  public Multi<AuditEntry> streamLogs() {
    return processor;
  }

    private AuditEntry mapToDomain(AuditEntryEntity entity) {
        Map<String, Object> details = Map.of();
        try {
            details = mapper.readValue(entity.details, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            LOG.error("Failed to deserialize audit details for entry " + entity.id, e);
        }
        
        return new AuditEntry(
            entity.id, entity.type, entity.actor, entity.userId, 
            entity.timestamp, entity.serverTimestamp, details, 
            entity.signature, entity.signer
        );
    }
}

