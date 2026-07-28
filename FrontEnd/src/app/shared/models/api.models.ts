export interface AuthTokens { access: string; refresh: string; }
export interface AuthUser { id: string; email: string; operatorId?: string; }
export interface AuthResponse extends AuthTokens { user?: AuthUser; }
export interface Profile { height: number; weight: number; metabolicEfficiency?: string; threatLevel?: string; }
