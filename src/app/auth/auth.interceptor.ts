import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    
    let authReq = req;
    // nếu có token, clone request gốc và thêm header
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    // chuyển request, trả về observable
    // pipe truyền observable qua catchError, bắt lỗi từ rquest
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred'; // thông báo mặc định
        
        // xác định loại lỗi và thông báo tương ứng
        switch (error.status) {
          case 401:
            errorMessage = 'Session expired. Please login again.';
            this.authService.logout();
            this.router.navigate(['/login']);
            break;
            
          case 403:
            errorMessage = 'You do not have permission to access this resource.';
            break;
            
          case 404:
            errorMessage = 'The requested resource was not found.';
            break;
            
          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            break;
            
          case 0:
            errorMessage = 'Network error. Please check your connection.';
            break;
          
          default:
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
        }
        
        //console.error('HTTP Error:', error);
        //console.error('Error Message:', errorMessage);
        
        this.showErrorNotification(errorMessage);
        
        // re-throw observable lỗi mới sau xử lý
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // hiển thị thông báo lỗi trong log
  private showErrorNotification(message: string): void {
    console.error('Error:', message);
  }
}