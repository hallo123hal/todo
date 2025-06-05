import { Component, OnInit } from '@angular/core';
import { TodoService, Todo } from '../todo.service';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html'
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  editingId: string | null = null; //lưu ID, nếu không đang sửa => null

  constructor(private todoService: TodoService) {}

  //subscribe để nghe dữ liệu từ Observable. Khi todos được nhận từ getTodos(), hàm call back gán dữ liệu nhận được vào this.todos
  ngOnInit() {
    this.todoService.getTodos().subscribe(todos => (this.todos = todos));
  }

  deleteTask(id: string) {
    this.todoService.deleteTodo(id);
  }

  updateTask(todo: Todo) {
    this.todoService.updateTodo(todo);
  }

  startEdit(todo: Todo) {
    this.editingId = todo.id!;
  }

  finishEdit(todo: Todo | null) {
    if (todo) {
      this.todoService.updateTodo(todo);
    }
    this.editingId = null;
  }
}
