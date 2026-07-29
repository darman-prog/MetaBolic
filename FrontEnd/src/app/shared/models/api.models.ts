// ---------------------------------------------------------------------------
// Auth models — contrato de autenticación JWT
// ---------------------------------------------------------------------------

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse extends AuthTokens {}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  // El backend acepta alias opcional; lo enviamos igual al username.
  alias?: string;
}
