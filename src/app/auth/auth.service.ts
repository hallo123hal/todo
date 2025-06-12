import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface User {
  id?: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private collectionName = 'users';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private afs: AngularFirestore) {
    // Kiểm tra localStorage để khôi phục trạng thái đăng nhập
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  // Đăng ký user mới
  register(username: string, password: string): Observable<any> {
    // Kiểm tra username đã tồn tại chưa
    return this.afs
      .collection<User>(this.collectionName, ref => 
        ref.where('username', '==', username)
      )
      .get()
      .pipe(
        switchMap(snapshot => {
          if (!snapshot.empty) {
            throw new Error('Username already exists');
          }
          
          const user: User = { username, password };
          return from(this.afs.collection<User>(this.collectionName).add(user));
        })
      );
  }

  // Đăng nhập
  login(username: string, password: string): Observable<LoginResponse> {
    return this.afs
      .collection<User>(this.collectionName, ref => 
        ref.where('username', '==', username).where('password', '==', password)
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        map(users => {
          if (users.length === 0) {
            throw new Error('Invalid username or password');
          }
          
          const user = users[0];
          // Tạo token đơn giản (trong thực tế nên dùng JWT từ server)
          const token = this.generateToken(user);
          
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', token);
          
          return { user, token };
        })
      );
  }

  // Đăng xuất
  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }

  // Lấy current user
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Kiểm tra đã đăng nhập chưa
  get isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null && this.getToken() !== null;
  }

  // Lấy token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Tạo token đơn giản (trong thực tế nên dùng JWT từ server)
  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      username: user.username,
      timestamp: Date.now()
    };
    return btoa(JSON.stringify(payload));
  }
}