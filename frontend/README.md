# Access Control Service - Frontend (ACS-UI)

The ACS-UI is the primary administrative web interface for the Access Control Service. It manages catalog registrations, identity governance, access requests, and compliance auditing.

## Technology Stack

The frontend has been completely modernized into a strictly typed environment:
- **Core Framework**: React 18, Vite.
- **Language**: TypeScript (converted from legacy JavaScript).
- **Styling**: Tailwind CSS & Lucide React.
- **Testing**: Vitest, React Testing Library.

## End-to-End Type Safety

The application strictly aligns its service interfaces and domain models with the backend's Data Transfer Objects (DTOs).

### Key Models

Domain models are synchronized using TypeScript interfaces in `src/models/dtos.ts` to reflect the Java counterparts. Important interfaces include:

1. **`LoginRequest`**: Standardizes the payload structure expected explicitly by `/api/auth/login`.
2. **`AuthConfig`**: Maps the dynamic authentication server properties consumed during Mock and OIDC authentication sessions.
3. **`UserContext`**: Strongly types the authorized identity and session data context.
4. **`CatalogRegistration`**: Exposes strict schema validation for the unity-catalog/gravitino data payload configuration.

### Services Layer

All `src/services/*` API definitions strictly implement generic return types extending `Promise<T>` based on their assigned API response structures.

## Quick Start

### Installation

```bash
# Clean module mappings and dependencies
rm -rf node_modules package-lock.json
npm install
```

### Development Server

Use `vite` to start the hot-reloading development server:
```bash
npm run dev
```

### Type Checking & Build

To ensure strict compliance with frontend models and create a sanitized production output:
```bash
npm run build
```

### Running the Test Suite

The comprehensive unit and component testing layers are powered directly via Vitest:
```bash
# Run tests individually
npm run test

# Run tests with detailed code-coverage thresholds
npm run coverage
```
