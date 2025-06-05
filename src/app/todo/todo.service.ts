import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

export interface Todo {
  id?: string;
  text: string;
  completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private collectionName = 'todos';

  constructor(private afs: AngularFirestore) {}

  getTodos(): Observable<Todo[]> {
    return this.afs.collection<Todo>(this.collectionName).valueChanges({ idField: 'id' });
  }

  addTodo(todo: Todo) {
    return this.afs.collection<Todo>(this.collectionName).add(todo);
  }

  updateTodo(todo: Todo) {
    return this.afs.collection(this.collectionName).doc(todo.id).update(todo);
  }

  deleteTodo(id: string) {
    return this.afs.collection(this.collectionName).doc(id).delete();
  }
}
