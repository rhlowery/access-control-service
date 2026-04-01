# Architecture Documentation

This page provides a high-level overview of the ACS Backend architecture using C4 and UML diagrams.

## System Context (C4)

The following diagram illustrates how the ACS Backend (BFF) orchestrates access requests across various identity and catalog providers.

```mermaid
graph TD
    subgraph "External Systems"
        IDP["Identity Providers (Okta/AzureAD)"]
        UC["Unity Catalog / Databricks"]
        Glue["AWS Glue / Lake Formation"]
        Other["Other Catalogs (Iceberg/Gravitino)"]
        Lineage["OpenLineage Consumer"]
        OTel["OTel Collector"]
    end

    subgraph "ACS Infrastructure"
        UI["ACS Frontend (Web UI)"]
        BFF["ACS Backend (BFF)"]
    end

    User["User (Consumer/Approver)"] -- "Interacts with" --> UI
    UI -- "REST / JWT" --> BFF
    BFF -- "Sign tokens as" --> IDP
    BFF -- "Syncs policies to" --> UC
    BFF -- "Syncs policies to" --> Glue
    BFF -- "Syncs policies to" --> Other
    BFF -- "Emits traces to" --> OTel
    BFF -- "Emits lineage to" --> Lineage
    BFF -- "Discovers metadata from" --> Metastores["Various Metastores (Unity, Polaris, etc.)"]
```

## Internal Architecture (C4 Level 3)
```mermaid
graph TB
    subgraph resources ["JAX-RS Resources"]
        AuthRes["AuthResource"]
        AccReqRes["AccessRequestResource"]
        CatRes["CatalogResource"]
        AudRes["AuditResource"]
        UserRes["UserResource"]
        MetaRes["MetastoreResource"]
        ProxyRes["ProxyResource"]
    end

    subgraph services ["Business Services"]
        UserSvc["UserService"]
        AccReqSvc["AccessRequestService"]
        CatSvc["CatalogService"]
        TokSvc["TokenService"]
    end

    subgraph infrastructure ["Infrastructure"]
        Augmentor["AcsSecurityIdentityAugmentor"]
        Lineage["LineageService"]
        Health["HealthCheck"]
        MockIdP["MockIdentityProvider"]
    end

    subgraph persistence ["JPA Entities"]
        UserEnt["UserEntity"]
        GroupEnt["GroupEntity"]
        AccReqEnt["AccessRequestEntity"]
        AuditEnt["AuditEntryEntity"]
    end

    AuthRes --> TokSvc
    AuthRes --> UserSvc
    AccReqRes --> AccReqSvc
    AccReqRes --> CatSvc
    AccReqRes --> Lineage
    CatRes --> CatSvc
    AudRes --> AccReqSvc
    UserRes --> UserSvc
    Augmentor --> UserSvc

    UserSvc --> UserEnt
    UserSvc --> GroupEnt
    AccReqSvc --> AccReqEnt
```

## Persona Resolution Strategy (UML Activity)
```mermaid
flowchart TD
    Start([Request Arrives]) --> Auth{Authenticated?}
    Auth -->|No| Anon[Return Anonymous]
    Auth -->|Yes| P1{DB User has persona?}
    P1 -->|Yes| UseDB["Use DB Persona"]
    P1 -->|No| P2{Group has persona mapping?}
    P2 -->|Yes| UseGroup["Use Group Persona"]
    P2 -->|No| P3{JWT has persona claim?}
    P3 -->|Yes| UseJWT["Use JWT Persona"]
    P3 -->|No| Default["No Persona (standard user)"]

    UseDB --> Enrich
    UseGroup --> Enrich
    UseJWT --> Enrich
    Default --> Enrich

    Enrich["Add persona + roles to SecurityIdentity"]
    Enrich --> AdminCheck{Persona == REQUESTER?}
    AdminCheck -->|Yes| SkipAdmin["Skip admin role promotion"]
    AdminCheck -->|No| PromoteAdmin{Has admin group/persona?}
    PromoteAdmin -->|Yes| AddAdmin["Add ADMIN, SECURITY_ADMIN, AUDITOR roles"]
    PromoteAdmin -->|No| SkipAdmin
    SkipAdmin --> Done([Return Augmented Identity])
    AddAdmin --> Done
```

## Domain Model (UML Class Diagram)
```mermaid
classDiagram
    class User {
        +String id
        +String name
        +String email
        +String role
        +String persona
        +List~String~ groups
    }
    class Group {
        +String id
        +String name
        +String description
        +String persona
    }
    class AccessRequest {
        +String id
        +String requesterId
        +String userId
        +String catalogName
        +String schemaName
        +String tableName
        +String status
        +String justification
        +String rejectionReason
        +List~String~ privileges
        +List~String~ approverGroups
        +Map metadata
        +Long expirationTime
    }
    class AuditEntry {
        +String id
        +String actor
        +String type
        +String details
        +long timestamp
    }
    class CatalogNode {
        +String id
        +String name
        +String type
        +String path
        +String permissions
    }

    User "1" --> "*" AccessRequest : creates
    User "*" --> "*" Group : belongs to
    Group "1" --> "*" User : contains
    AccessRequest "*" --> "1" CatalogNode : targets
    AccessRequest "*" --> "*" Group : requires approval from
    AuditEntry "*" --> "1" User : involves
```

## Generic Catalog Interface

The ACS Backend provides a pluggable architecture for interacting with various data catalogs. This is achieved through the `CatalogProvider` SPI (Service Provider Interface).

### Key Components:

*   **CatalogProvider**: The interface that all catalog implementations must satisfy.
*   **ServiceLoader**: Used to dynamically discover and load available catalog providers at runtime.
*   **Common Domain**: Unified `CatalogNode` and `NodeType` definitions allow for a consistent experience across different catalog backends.

Available implementations include:
*   **UnityCatalogNodeProvider**
*   **GlueNodeProvider**
*   **DatabricksNodeProvider**
*   **IcebergNodeProvider**
*   **PolarisNodeProvider**
*   **DataHubNodeProvider**
*   **GravitinoNodeProvider**
*   **AtlanNodeProvider**
*   **HiveMetastoreNodeProvider**

## Metastore Discovery

The system provides an enhanced metadata discovery API (`/api/metastores/`) tailored for deep catalog exploration. Key features include:
*   **Recursive Fetching**: Support for a `depth` parameter to fetch children multiple levels deep in a single request.
*   **Fully-Qualified Paths**: All results are returned as a flat list of paths with associated metadata.
*   **Pagination**: Built-in support for paginating large nodes using `page_token` and `next_page_token`.

## Technical Stack

*   **Runtime**: Quarkus (Java 17)
*   **API**: REST with JAX-RS (RestEasy Reactive)
*   **Security**: SmallRye JWT
*   **Observability**: SmallRye Health & Micrometer Prometheus
*   **Testing**: JUnit 5, RestAssured, Cucumber

## Observability

The system implements advanced observability using two key frameworks:

### OpenTelemetry (OTel)
Used for distributed tracing. Every request to the BFF is automatically traced, providing visibility into the full request lifecycle from the frontend to backend and downstream proxies.

### OpenLineage
Used for tracking data and process flows. When an access request is submitted, approved, or rejected, a lineage event is emitted to capture the transition of metadata between the user and the Unity Catalog datasets.
