import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  save(profile: Profile): Observable<Profile> { return this.http.post<Profile>('/api/profile/biometrics/', profile); }
  get(): Observable<Profile> { return this.http.get<Profile>('/api/profile/'); }
}
