# Access Control Service - Architecture Documentation

## Overview
The Access Control Service (ACS) is a centralized security and governance middleware designed to manage access policies across heterogeneous data catalogs (Databricks Unity Catalog, Hive Metastore, Glue, etc.) and identity providers (Keycloak, Okta, Azure AD).

## System Context (C4 Level 1)
The following diagram illustrates the relationship between users, the ACS project, and external infrastructure (Identity Providers and Data Catalogs).

```mermaid
graph TD
    User(["👤 Data Analyst / Engineer"])
    Admin(["🔧 Platform Admin"])
    ACS["🛡️ Access Control Service"]
    IdP["🔑 Identity Provider<br/>Keycloak / OIDC"]
    UC["📦 Unity Catalog"]
    HMS["🗄️ Hive Metastore"]
    DB[("🗃️ PostgreSQL")]
    OTel["📊 OpenTelemetry Collector"]

    User -->|"Authenticates"| IdP
    Admin -->|"Manages Personas & Policies"| ACS
    User -->|"Requests Access"| ACS
    ACS -->|"Validates Identity (JWKS)"| IdP
    ACS -->|"Discovers Metadata"| UC
    ACS -->|"Discovers Metadata"| HMS
    ACS -->|"Orchestrates Policies"| UC
    ACS -->|"Stores Requests / Audit / Users"| DB
    ACS -.->|"Emits Traces"| OTel
```

## Container Architecture (C4 Level 2)
ACS is composed of a React-based frontend and a Quarkus-based backend. The backend acts as a **Backend-for-Frontend (BFF)**, handling OIDC complexity and policy orchestration.

```mermaid
graph LR
    subgraph frontend ["Frontend (React)"]
      UI["React SPA"]
    end

    subgraph acs ["ACS Backend (Quarkus)"]
      direction TB
      API["REST API Layer<br/>(JAX-RS Resources)"]
      Auth["AuthResource"]
      Req["AccessRequestResource"]
      Cat["CatalogResource"]
      Svc["Business Services"]
      JPA["JPA / Panache"]
    end

    UI -->|"REST / bff_jwt Cookie"| API
    API --- Auth
    API --- Req
    API --- Cat
    Auth --> Svc
    Req --> Svc
    Cat --> Svc
    Svc --> JPA
    JPA --> DB[("PostgreSQL")]
    Svc -.->|"RestClient"| ExtCat["External Catalogs<br/>(UC, HMS)"]
```

## Authentication Flow (OIDC + BFF)
ACS uses a Backend-for-Frontend (BFF) pattern with dynamic OIDC discovery for production environments, while maintaining a Mock IdP for testing.

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend (ACS)
    participant K as Keycloak (OIDC)
    participant A as Augmentor
    participant DB as PostgreSQL

    U->>F: Access UI
    F->>B: GET /api/auth/config
    B-->>F: OIDC Server URL + Client ID
    F->>K: Redirect to Login
    K-->>F: Authorization Code
    F->>B: POST /api/auth/login (code or credentials)
    B->>K: Exchange Code for Token (via OIDC)
    K-->>B: ID Token / Access Token
    B->>A: Augment SecurityIdentity
    A->>DB: Lookup User & Group personas
    DB-->>A: Persona = GOVERNANCE_ADMIN
    A-->>B: Enriched Identity (roles + persona)
    B->>B: Create BFF JWT (bff_jwt cookie)
    B-->>F: 200 OK + Set-Cookie
    F->>B: GET /api/auth/me (with cookie)
    B-->>F: User profile + persona
```

## Module Documentation
For detailed implementation details, please refer to the specific module documentation:
- **[ACS Backend](backend/index.html)**: Internal components, SPIs, and domain models.
- **[ACS Frontend](frontend/index.html)**: UI components and state management.
- **[ACS Deployment](helm/index.html)**: Helm charts and Kubernetes configuration.
