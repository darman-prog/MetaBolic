// ---------------------------------------------------------------------------
// Auth models — contrato de autenticación JWT
// ---------------------------------------------------------------------------

export interface AuthTokens {
  access: string;
  /** Refresh token ahora viaja en cookie httpOnly; en JSON solo cuando el cliente no soporta cookies. */
  refresh?: string;
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
