# ACS Deployment (Helm)

The Access Control Service (ACS) is deployed as a unified Helm stack that orchestrates the backend, frontend, and all necessary supporting infrastructure.

## Cluster Prerequisites

Before deploying the ACS Helm chart, ensure the following operators and controllers are installed in your Kubernetes cluster:

### 🐘 CloudNativePG Operator
The deployment uses the `postgresql.cnpg.io/v1` API to manage high-availability PostgreSQL clusters. The [CloudNativePG operator](https://cloudnative-pg.io/docs/en/latest/installation_upgrade/) must be installed and running in the cluster to reconcile the database requirements.

### 🔐 cert-manager
ACS leverages [cert-manager](https://cert-manager.io/docs/installation/) for automated certificate management. The default configuration expects a `ClusterIssuer` named `selfsigned-issuer` (or similar) to provide TLS for the ingress resources.

### 🌐 ingress-nginx
The chart is optimized for the [ingress-nginx](https://kubernetes.github.io/ingress-nginx/) controller. It uses `ingressClassName: nginx` by default. Ensure the controller is installed and capable of handling `localtest.me` or `sslip.io` derived hostnames.

---

## What is Installed

The unified chart installs the following components (some are optional and can be toggled in `values.yaml`):

| Component | Description | Default Status |
|:---|:---|:---|
| **ACS Backend** | The core Quarkus (BFF) service. | Enabled |
| **ACS UI** | The React-based frontend SPA. | Enabled |
| **PostgreSQL** | A HA cluster managed by CloudNativePG. | Enabled |
| **Keycloak** | Identity Provider (OIDC) pre-configured for ACS. | Enabled |
| **MinIO** | S3-compatible object storage for catalog data. | Enabled |
| **Unity Catalog** | Standalone Unity Catalog server. | Enabled |
| **Hive Metastore**| Traditional Hadoop Hive Metastore. | Enabled |
| **Gravitino** | Metadata lakehouse management. | Enabled |
| **Polaris** | Apache Polaris (Incubating) catalog. | Enabled |
| **Observability** | Prometheus server and OpenTelemetry Collector. | Enabled |

---

## Default Configuration

The chart comes pre-configured for **local development (KIND/Docker Desktop)**.

### Resource Limits
Standardized resource requests and limits are applied to ensure stability:
- **Backend**: 256Mi – 512Mi Memory, 100m – 500m CPU.
- **Keycloak**: 512Mi – 1024Mi Memory, 100m – 500m CPU.

### Connectivity
In the default `values.yaml`, all services are linked via internal Kubernetes DNS but exposed through Ingress:
- **Frontend**: `http://acs.localtest.me`
- **Backend API**: `http://api.localtest.me`
- **Identity Provider**: `http://idp.localtest.me`

### Security
- **OIDC**: Pre-configured to trust the deployed Keycloak instance.
- **TLS**: Enabled via cert-manager annotations on ingresses.

---

## Verification & Packaging

Use the Maven wrapper to package and lint the charts:

```bash
./mvnw helm:package
```

To install the chart:
```bash
helm install acs-service ./src/main/helm
```
