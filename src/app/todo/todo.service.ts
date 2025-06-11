import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

export interface Todo {
  id?: string;
  text: string;
  completed: boolean;
  order?: number;
  userId: string;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private collectionName = 'todos';

  constructor(private afs: AngularFirestore, private authService: AuthService) {}

  // Lấy todos của user hiện tại - xử lý trường hợp chưa có collection
  getTodos(): Observable<Todo[]> {
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      console.warn('User not authenticated');
      return of([]); // Trả về empty array thay vì throw error
    }

    console.log('Current user ID:', currentUser.id); // Debug log

    return this.afs
      .collection<Todo>(this.collectionName, ref => 
        ref.where('userId', '==', currentUser.id)
        //.orderBy('order', 'asc')
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        catchError(error => {
          console.error('Error fetching todos:', error);
          // Log chi tiết lỗi
          if (error.code === 'failed-precondition') {
            console.error('Firestore index needed. Check the error message for the index creation link.');
          }
          return of([]); // Trả về empty array khi có lỗi
        })
      );
  }

  // Thêm todo cho user hiện tại - đơn giản hóa logic order
  addTodo(todoText: string): Observable<any> {
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const newTodo: Omit<Todo, 'id'> = {
      text: todoText,
      completed: false,
      userId: currentUser.id!,
      order: Date.now() // Sử dụng timestamp để đảm bảo unique order
    };

    return from(this.afs.collection<Todo>(this.collectionName).add(newTodo));
  }

  updateTodo(todo: Todo): Promise<void> {
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Đảm bảo chỉ update todo của user hiện tại
    if (todo.userId !== currentUser.id) {
      throw new Error('Unauthorized to update this todo');
    }

    return this.afs.collection(this.collectionName).doc(todo.id).update(todo);
  }

  deleteTodo(id: string): Promise<void> {
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Kiểm tra todo có thuộc về user hiện tại không
    return this.afs.collection(this.collectionName).doc(id).get().toPromise()
      .then(doc => {
        if (!doc?.exists) {
          throw new Error('Todo not found');
        }
        
        const todoData = doc.data() as Todo;
        if (todoData.userId !== currentUser.id) {
          throw new Error('Unauthorized to delete this todo');
        }
        
        return this.afs.collection(this.collectionName).doc(id).delete();
      });
  }
}