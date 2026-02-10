import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private API = 'http://localhost:8080/auth';

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
