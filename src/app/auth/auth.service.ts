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
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  register(username: string, password: string): Observable<any> {
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
          const token = this.generateToken(user);
          
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', token);
          
          return { user, token };
        })
      );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null && this.getToken() !== null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      username: user.username,
      timestamp: Date.now()
    };
    return btoa(JSON.stringify(payload));
  }
}