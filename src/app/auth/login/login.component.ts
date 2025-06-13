import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    // kiểm tra thủ công, không có validation vì là template-driven form
    if (!this.username || !this.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = '';

    // gọi service đăng nhập
    this.authService.login(this.username, this.password).subscribe({
      next: (user) => {
        this.loading = false;
        this.router.navigate(['/todos']);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.message || 'Login failed';
      }
    });
  }
}