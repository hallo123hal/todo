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

    // Nếu đã đăng nhập và có token hợp lệ
    if (isLoggedIn && hasValidToken) {
      // Nếu đang cố truy cập login hoặc register, redirect về todos
      if (url === 'login' || url === 'register') {
        this.router.navigate(['/todos']);
        return false;
      }
      // Cho phép truy cập các route khác (như todos)
      return true;
    } else {
      // Nếu chưa đăng nhập hoặc không có token
      // Xóa thông tin user nếu token không hợp lệ
      if (!hasValidToken && isLoggedIn) {
        this.authService.logout();
      }
      
      // Cho phép truy cập login và register
      if (url === 'login' || url === 'register') {
        return true;
      }
      // Redirect về login cho các route khác
      this.router.navigate(['/login']);
      return false;
    }
  }
}