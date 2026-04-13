export interface LoginRequest {
    userId: string;
    password?: string;
    providerId?: string;
    role?: string;
    persona?: string;
    groups?: string[];
}

export interface CatalogRegistration {
    id: string;
    name?: string;
    type?: string;
    settings?: Record<string, any>;
}

export interface AuthConfig {
    authServerUrl: string;
    clientId: string;
    isMock?: boolean;
    authType?: string;
    mockUsers?: Array<{
        userId: string;
        name: string;
        persona: string;
    }>;
}

export interface UserContext {
    userId: string;
    persona?: string;
    [key: string]: any;
}
