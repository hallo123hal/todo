import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';

export interface Todo {
  id?: string;
  text: string;
  completed: boolean;
  order?: number;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private collectionName = 'todos';

  constructor(private afs: AngularFirestore) {}

  // trả về Observable chứa mảng Todo. Hàm callback sắp xếp theo thứ tự tăng dần của order
  // valueChanges trả về Observable phát ra dữ liệu mới khi có thay đổi
  getTodos(): Observable<Todo[]> {
    return this.afs
      .collection<Todo>(this.collectionName, ref => ref.orderBy('order', 'asc'))
      .valueChanges({ idField: 'id' });
  }

  // return from, chuyển Promise (get()) thành Observable
  // orderBy sắp xếp giảm dần, limit trả về 1 => lớn nhất
  // snapshot (data ngay tại thời điểm đó) giải quyết promise trả về từ get()
  // !snapshot.empty => có tài liệu tìm thấy
  // snapshot.docs[0].data().order || 0 => lấy giá trị order của tài liệu đầu tiên hoặc trả về 0 nếu không có
  // const todoWithOrder = {...todo, order: newOrder }; => tạo một đối tượng mới todoWithOrder bằng cách sao chép các thuộc tính từ todo và thêm thuộc tính order với giá trị newOrder
  addTodo(todo: Todo) {
    const collectionRef = this.afs.collection<Todo>(this.collectionName);

    return from(
      collectionRef.ref
        .orderBy('order', 'desc')
        .limit(1)
        .get()
        .then(snapshot => {
          let newOrder = 1;
          if (!snapshot.empty) {
            const maxOrder = snapshot.docs[0].data().order || 0;
            newOrder = maxOrder + 1;
          }
          const todoWithOrder = { ...todo, order: newOrder };
          return collectionRef.add(todoWithOrder);
        })
    );
  }

  updateTodo(todo: Todo) {
    return this.afs.collection(this.collectionName).doc(todo.id).update(todo);
  }

  deleteTodo(id: string) {
    return this.afs.collection(this.collectionName).doc(id).delete();
  }
}
