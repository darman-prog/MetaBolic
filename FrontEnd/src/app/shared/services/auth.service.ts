import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, AuthUser } from '../models/api.models';

const ACCESS_TOKEN = 'metabolic.access';
const REFRESH_TOKEN = 'metabolic.refresh';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api';
  readonly currentUser = signal<AuthUser | null>(null);

  isAuthenticated(): boolean { return Boolean(this.accessToken); }
  get accessToken(): string | null { return this.read(ACCESS_TOKEN); }
  get refreshToken(): string | null { return this.read(REFRESH_TOKEN); }

  login(credentials: { operatorId: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/token/`, { username: credentials.operatorId, password: credentials.password }).pipe(tap(response => this.persist(response)));
  }

  register(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register/`, data).pipe(tap(response => this.persist(response)));
  }

  refresh(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/token/refresh/`, { refresh: this.refreshToken }).pipe(tap(response => this.persist(response)));
  }

  logout(): void { localStorage.removeItem(ACCESS_TOKEN); localStorage.removeItem(REFRESH_TOKEN); this.currentUser.set(null); }

  private persist(response: AuthResponse): void {
    localStorage.setItem(ACCESS_TOKEN, response.access);
    localStorage.setItem(REFRESH_TOKEN, response.refresh);
    this.currentUser.set(response.user ?? null);
  }

  private read(key: string): string | null { return typeof localStorage === 'undefined' ? null : localStorage.getItem(key); }
}
