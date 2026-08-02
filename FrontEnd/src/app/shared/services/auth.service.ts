import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginCredentials, RegisterPayload } from '../models/api.models';
import { OperatorProfileRead } from '../models/domain.models';
import { ProfileStore } from './profile.store';

const ACCESS_TOKEN = 'metabolic.access';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly profileStore = inject(ProfileStore);

  readonly currentUser = signal<OperatorProfileRead | null>(null);

  isAuthenticated(): boolean {
    return Boolean(this.accessToken);
  }

  get accessToken(): string | null {
    return this.read(ACCESS_TOKEN);
  }

  get refreshToken(): string | null {
    return null;
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login/`, credentials)
      .pipe(tap(response => this.persistTokens(response)));
  }

  /**
   * Registra un nuevo operador y luego inicia sesión automáticamente.
   * El backend devuelve el perfil pero sin tokens, por eso hacemos login inmediato.
   */
  register(payload: RegisterPayload): Observable<AuthResponse> {
    const registration = { ...payload, alias: payload.username };
    return this.http
      .post<OperatorProfileRead>(`${this.apiUrl}/auth/register/`, registration)
      .pipe(
        switchMap(() =>
          this.login({ username: payload.username, password: payload.password })
        )
      );
  }

  refresh(): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/refresh/`, {})
      .pipe(tap(response => this.persistTokens(response)));
  }

  me(): Observable<OperatorProfileRead> {
    return this.http.get<OperatorProfileRead>(`${this.apiUrl}/profile/`).pipe(
      tap(profile => {
        this.currentUser.set(profile);
        this.profileStore.set(profile);
      })
    );
  }

  logout(): void {
    this.clearLocalSession();
    this.http
      .post(`${this.apiUrl}/auth/logout/`, {})
      .pipe(tap({ error: () => {} }))
      .subscribe();
  }

  private clearLocalSession(): void {
    this.remove(ACCESS_TOKEN);
    this.currentUser.set(null);
    this.profileStore.clear();
  }

  private persistTokens(response: AuthResponse): void {
    this.write(ACCESS_TOKEN, response.access);
  }

  private read(key: string): string | null {
    if (typeof sessionStorage === 'undefined') return null;
    return sessionStorage.getItem(key);
  }

  private write(key: string, value: string): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(key, value);
    }
  }

  private remove(key: string): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  }

  static extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.error && typeof error.error === 'object') {
        const messages = Object.entries(error.error)
          .map(([field, value]) => {
            const text = Array.isArray(value) ? value.join(', ') : String(value);
            return `${field}: ${text}`;
          })
          .join(' | ');
        return messages || `AUTH_ERROR // ${error.status}`;
      }
      return `AUTH_ERROR // ${error.status}: ${error.statusText}`;
    }
    return 'AUTH_ERROR // UNKNOWN';
  }
}
