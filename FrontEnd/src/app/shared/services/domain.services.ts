import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ExerciseModuleRead,
  ExerciseModuleWrite,
  MissionRead,
  MissionWrite,
  MuscleGroupVolumeSummary,
  PaginatedResponse,
  ProgressEntryRead,
  ProgressEntryWrite,
  ProgressSummary,
  ProtocolRead,
  ProtocolWrite,
  TrainingSessionRead,
  TrainingSessionWrite,
} from '../models/domain.models';
import { MissionStatus } from '../constants/domain.constants';
import { ProfileService } from './profile.service';

@Injectable({ providedIn: 'root' })
export class ProtocolsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/protocols`;

  list(page = 1): Observable<PaginatedResponse<ProtocolRead>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<PaginatedResponse<ProtocolRead>>(this.apiUrl, { params });
  }

  get(id: string): Observable<ProtocolRead> {
    return this.http.get<ProtocolRead>(`${this.apiUrl}/${id}/`);
  }

  create(payload: ProtocolWrite): Observable<ProtocolRead> {
    return this.http.post<ProtocolRead>(`${this.apiUrl}/`, payload);
  }

  update(id: string, payload: ProtocolWrite): Observable<ProtocolRead> {
    return this.http.put<ProtocolRead>(`${this.apiUrl}/${id}/`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  replaceModules(
    id: string,
    modules: ExerciseModuleWrite[]
  ): Observable<ExerciseModuleRead[]> {
    return this.http.post<ExerciseModuleRead[]>(`${this.apiUrl}/${id}/modules/`, modules);
  }
}

@Injectable({ providedIn: 'root' })
export class MissionsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/missions`;
  private readonly profileService = inject(ProfileService);

  list(page = 1, status?: MissionStatus): Observable<PaginatedResponse<MissionRead>> {
    let params = new HttpParams().set('page', page);
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<PaginatedResponse<MissionRead>>(this.apiUrl, { params });
  }

  get(id: string): Observable<MissionRead> {
    return this.http.get<MissionRead>(`${this.apiUrl}/${id}/`);
  }

  create(payload: MissionWrite): Observable<MissionRead> {
    return this.http.post<MissionRead>(`${this.apiUrl}/`, payload);
  }

  update(id: string, payload: MissionWrite): Observable<MissionRead> {
    return this.http.patch<MissionRead>(`${this.apiUrl}/${id}/`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  complete(id: string): Observable<MissionRead> {
    return this.http.post<MissionRead>(`${this.apiUrl}/${id}/complete/`, {}).pipe(
      switchMap(mission =>
        this.profileService.get().pipe(
          tap(() => mission),
          switchMap(() => of(mission))
        )
      )
    );
  }
}

@Injectable({ providedIn: 'root' })
export class SessionsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/sessions`;

  list(page = 1, dateFrom?: string, dateTo?: string): Observable<PaginatedResponse<TrainingSessionRead>> {
    let params = new HttpParams().set('page', page);
    if (dateFrom) params = params.set('date_from', dateFrom);
    if (dateTo) params = params.set('date_to', dateTo);
    return this.http.get<PaginatedResponse<TrainingSessionRead>>(this.apiUrl, { params });
  }

  create(payload: TrainingSessionWrite): Observable<TrainingSessionRead> {
    return this.http.post<TrainingSessionRead>(`${this.apiUrl}/`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  // NO update/patch: el backend solo expone GET, POST, DELETE.
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/progress`;

  list(page = 1): Observable<PaginatedResponse<ProgressEntryRead>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<PaginatedResponse<ProgressEntryRead>>(this.apiUrl, { params });
  }

  create(entry: ProgressEntryWrite): Observable<ProgressEntryRead> {
    return this.http.post<ProgressEntryRead>(`${this.apiUrl}/`, entry);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  summary(): Observable<ProgressSummary> {
    return this.http.get<ProgressSummary>(`${this.apiUrl}/summary/`);
  }

  volumeByGroup(): Observable<MuscleGroupVolumeSummary[]> {
    return this.http.get<MuscleGroupVolumeSummary[]>(`${this.apiUrl}/volume_by_group/`);
  }
}
