import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private API = `${API_CONFIG.baseUrl}/auth`;

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.API}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.API}/reset-password`, {
      token,
      password,
    });
  }
  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.API}/verify-email?token=${token}`);
  }
}
