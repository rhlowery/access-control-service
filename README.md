# Access Control Service (ACS) Monorepo

Welcome to the ACS project. This monorepo contains the following components:

- **[backend/](backend/README.md)**: Quarkus-based middleware for access governance.
- **[frontend/](frontend/)**: React-based administrative UI.
- **[helm/](helm/)**: Unified Helm charts for local (Docker Desktop / Kind) and production deployment.

## Stabilized Stack (Local Development)

The project is optimized for deployment in a local Kubernetes cluster (e.g., Docker Desktop or KIND) with the following hostnames:

| Component | URL |
|:---|:---|
| **ACS UI** | http://acs.localtest.me |
| **ACS Backend API** | http://api.localtest.me |
| **Keycloak (IDP)** | http://idp.localtest.me |
| **MinIO Console** | http://console.s3.localtest.me |
| **MinIO S3 API** | http://s3.localtest.me |
| **Gravitino** | http://gravitino.localtest.me |
| **Unity Catalog** | http://unity.localtest.me |

## Getting Started

### 1. Build the Project
Use the unified Maven wrapper to build all submodules and container images:
```bash
./mvnw -Pcontainer clean package -DskipTests
```

### 2. Load Images (Kind)
If using KIND, load the local images:
```bash
kind load docker-image rhlowery/acs-backend:1.0.0-SNAPSHOT
kind load docker-image rhlowery/acs-ui:1.0.0-SNAPSHOT
```

### 3. Deploy to Kubernetes
Use the umbrella Helm chart in the `acs-demo` namespace:
```bash
helm upgrade --install acs-app helm/src/main/helm --namespace acs-demo --create-namespace
```

### 4. Authentication
- **Default Login**: `admin` / `admin` (via Mock Provider)
- **OIDC Realm**: `access-control`
- **SSO**: All components are integrated with the `access-control` realm on Keycloak.

## Architecture
See the **[Architecture Documentation](backend/docs/architecture.md)** for detailed diagrams and sequence flows.
