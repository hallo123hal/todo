import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const isLoggedIn = this.authService.isLoggedIn;
    const hasValidToken = this.authService.getToken() !== null;
    const url = route.url[0]?.path;

    if (isLoggedIn && hasValidToken) {
      // login rồi block vào login hoặc register
      if (url === 'login' || url === 'register') {
        this.router.navigate(['/todos']);
        return false;
      }
      return true;
    } else {
      // mất token hoặc chưa login => logout
      if (!hasValidToken && isLoggedIn) {
        this.authService.logout();
      }
      
      if (url === 'login' || url === 'register') {
        return true;
      }
      this.router.navigate(['/login']);
      return false;
    }
  }
}