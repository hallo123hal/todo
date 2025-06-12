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
    const token = this.authService.getToken();
    
    let authReq = req;
    if (token) {
      // clone request, thêm auth Header
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    // log lỗi request
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';
        
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
            // ưu tiên message từ server
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
        }
        
        // log lỗi ra console
        console.error('HTTP Error:', error);
        console.error('Error Message:', errorMessage);
        
        this.showErrorNotification(errorMessage);
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  
  // hiện thông báo lỗi
  private showErrorNotification(message: string): void {
    console.error('Error:', message);
  }
}