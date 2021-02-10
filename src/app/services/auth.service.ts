import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

const helper = new JwtHelperService();
const TOKEN_KEY = 'jwt-token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user: Observable<any>;
  private userData = new BehaviorSubject(null);

  constructor(
    private storage: Storage,
    private http: HttpClient,
    private plt: Platform,
    private router: Router) {
    this.loadStoredToken();
  }

  loadStoredToken() {
    let platform$ = from(this.plt.ready());
    this.user = platform$.pipe(
      switchMap(() => {
        return from(this.storage.get(TOKEN_KEY))
      }),
      map(token => {
        console.log('token from storage: ', token);
        if (token) {
          let decoded = helper.decodeToken(token);
          console.log('decoded', decoded);
          this.userData.next(decoded);
          return true;
        } else {
          return null;
        }
      })
    );
  }

  login(credentials: { email: string, pw: string }): Observable<any> {
    if (credentials.email !== 'mario.rossi@gmail.com' && credentials.pw !== '123') {
      return of(null);
    }

    return this.http.get('https://randomuser.me/api/').pipe(
      take(1),
      map(res => {
        // Extract the JWT, here we just fake it
        return `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE1Njc2NjU3MDYsImV4cCI6MTU5OTIwMTcwNiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiMTIzNDUiLCJmaXJzdF9uYW1lIjoiU2ltb24iLCJsYXN0X25hbWUiOiJHcmltbSIsImVtYWlsIjoic2FpbW9uQGRldmRhY3RpYy5jb20ifQ.4LZTaUxsX2oXpWN6nrSScFXeBNZVEyuPxcOkbbDVZ5U`;
      }),
      switchMap(token => {
        let decoded = helper.decodeToken(token);
        console.log('login decoded', decoded);
        this.userData.next(decoded);

        let storage$ = this.storage.set(TOKEN_KEY, token);
        return storage$;
      })
    );
  }

  getUser() {
    return this.userData.getValue();
  }

  logout() {
    this.storage.remove(TOKEN_KEY).then(() => {
      this.router.navigateByUrl('/');
      this.userData.next(null);
    });
  }
}
