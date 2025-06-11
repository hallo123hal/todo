import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface Todo {
  id?: string;
  text: string;
  completed: boolean;
  order?: number;
  userId: string; // Thêm userId để liên kết với user
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private collectionName = 'todos';

  constructor(private afs: AngularFirestore, private authService: AuthService) {}

  // Lấy todos của user hiện tại
  getTodos(): Observable<Todo[]> {
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    return this.afs
      .collection<Todo>(this.collectionName, ref => 
        ref.where('userId', '==', currentUser.id)
           .orderBy('order', 'asc')
      )
      .valueChanges({ idField: 'id' });
  }

  // Thêm todo cho user hiện tại
  addTodo(todo: Omit<Todo, 'userId'>) {
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const collectionRef = this.afs.collection<Todo>(this.collectionName);

    return from(
      collectionRef.ref
        .where('userId', '==', currentUser.id)
        .orderBy('order', 'desc')
        .limit(1)
        .get()
        .then(snapshot => {
          let newOrder = 1;
          if (!snapshot.empty) {
            const maxOrder = snapshot.docs[0].data().order || 0;
            newOrder = maxOrder + 1;
          }
          
          const todoWithUserAndOrder = { 
            ...todo, 
            userId: currentUser.id!, 
            order: newOrder 
          };
          
          return collectionRef.add(todoWithUserAndOrder);
        })
    );
  }

  updateTodo(todo: Todo) {
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

  deleteTodo(id: string) {
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