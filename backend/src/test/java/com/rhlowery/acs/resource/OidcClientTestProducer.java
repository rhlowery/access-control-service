package com.rhlowery.acs.resource;

import io.quarkus.oidc.client.OidcClient;
import io.quarkus.test.Mock;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import org.mockito.Mockito;

@ApplicationScoped
public class OidcClientTestProducer {

  @Produces
  @Mock
  @ApplicationScoped
  public OidcClient produceMockOidcClient() {
    return Mockito.mock(OidcClient.class);
  }
}
