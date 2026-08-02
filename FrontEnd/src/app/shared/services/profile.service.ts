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
    const payload = this.buildPayload(profile);
    return this.http
      .patch<OperatorProfileRead>(`${this.apiUrl}/profile/`, payload)
      .pipe(tap(updated => this.profileStore.set(updated)));
  }

  private buildPayload(profile: OperatorProfileWrite): OperatorProfileWrite | FormData {
    if (profile.avatar instanceof File) {
      const formData = new FormData();
      if (profile.alias !== undefined) formData.append('alias', profile.alias);
      if (profile.height_cm !== undefined) formData.append('height_cm', String(profile.height_cm));
      if (profile.current_weight_kg !== undefined) formData.append('current_weight_kg', String(profile.current_weight_kg));
      formData.append('avatar', profile.avatar);
      return formData;
    }
    return profile;
  }
}
