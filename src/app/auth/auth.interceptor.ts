import { Injectable } from '@angular/core';
import { 
  HttpInterceptor, 
  HttpRequest, 
  HttpHandler, 
  HttpEvent, 
  HttpErrorResponse 
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Lấy token từ AuthService
    const token = this.authService.getToken();
    
    // Clone request và thêm Authorization header nếu có token
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    // Xử lý request và response
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Xử lý các loại lỗi khác nhau
        let errorMessage = 'An error occurred';
        
        switch (error.status) {
          case 401:
            // Unauthorized - token hết hạn hoặc không hợp lệ
            errorMessage = 'Session expired. Please login again.';
            this.authService.logout();
            this.router.navigate(['/login']);
            break;
            
          case 403:
            // Forbidden - không có quyền truy cập
            errorMessage = 'You do not have permission to access this resource.';
            break;
            
          case 404:
            // Not Found
            errorMessage = 'The requested resource was not found.';
            break;
            
          case 500:
            // Internal Server Error
            errorMessage = 'Internal server error. Please try again later.';
            break;
            
          case 0:
            // Network error
            errorMessage = 'Network error. Please check your connection.';
            break;
            
          default:
            // Lấy message từ server nếu có
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
        }
        
        // Log lỗi để debug
        console.error('HTTP Error:', error);
        console.error('Error Message:', errorMessage);
        
        // Có thể thêm toast notification ở đây
        this.showErrorNotification(errorMessage);
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  private showErrorNotification(message: string): void {
    // Có thể integrate với toast service hoặc notification service
    // Ví dụ đơn giản với alert
    console.error('Error:', message);
    
    // Hoặc có thể emit event để component khác xử lý
    // this.notificationService.showError(message);
  }
}