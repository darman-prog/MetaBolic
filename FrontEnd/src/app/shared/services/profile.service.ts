import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OperatorProfileRead, OperatorProfileWrite } from '../models/domain.models';
import { ProfileStore } from './profile.store';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly profileStore = inject(ProfileStore);

  get(): Observable<OperatorProfileRead> {
    return this.http
      .get<OperatorProfileRead>(`${this.apiUrl}/profile/`)
      .pipe(tap(profile => this.profileStore.set(profile)));
  }

  update(profile: OperatorProfileWrite): Observable<OperatorProfileRead> {
    return this.http
      .patch<OperatorProfileRead>(`${this.apiUrl}/profile/`, profile)
      .pipe(tap(updated => this.profileStore.set(updated)));
  }
}
