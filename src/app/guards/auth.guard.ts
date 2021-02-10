import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private alertCtrl: AlertController) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.authService.user.pipe(
      take(1),  // take only one result, it contains auth token read from the storage
      map(user => {
        console.log('in canActivate: ', user);
        if (!user) {
          this.alertCtrl.create({
            header: 'Unauthorized',
            message: 'You are not allowed to access that page.',
            buttons: ['OK']
          }).then(alert => alert.present());

          this.router.navigateByUrl('/');

          return false;
        } else {
          return true;
        }
      })
    );
  }

}
