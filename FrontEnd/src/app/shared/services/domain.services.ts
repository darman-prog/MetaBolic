import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Protocol { id: string; name: string; status: 'ALPHA' | 'STABLE' | 'BETA'; modules: number; duration: number; calories: number; }
export interface Mission { id: string; name: string; priority: 'ALTO' | 'MEDIO' | 'BAJO'; progress: number; status: 'PENDIENTE' | 'COMPLETADA'; }

@Injectable({ providedIn: 'root' })
export class ProtocolsService { private readonly http = inject(HttpClient); list(): Observable<Protocol[]> { return this.http.get<Protocol[]>('/api/protocols/'); } create(value: Partial<Protocol>): Observable<Protocol> { return this.http.post<Protocol>('/api/protocols/', value); } }
@Injectable({ providedIn: 'root' })
export class MissionsService { private readonly http = inject(HttpClient); list(): Observable<Mission[]> { return this.http.get<Mission[]>('/api/missions/'); } create(value: Partial<Mission>): Observable<Mission> { return this.http.post<Mission>('/api/missions/', value); } }
@Injectable({ providedIn: 'root' })
export class SessionsService { private readonly http = inject(HttpClient); list(): Observable<unknown[]> { return this.http.get<unknown[]>('/api/sessions/'); } create(value: unknown): Observable<unknown> { return this.http.post('/api/sessions/', value); } }
@Injectable({ providedIn: 'root' })
export class ProgressService { private readonly http = inject(HttpClient); summary(): Observable<unknown> { return this.http.get('/api/progress/'); } }
