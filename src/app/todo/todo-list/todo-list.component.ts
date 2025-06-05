import { Component, OnInit } from '@angular/core';
import { TodoService, Todo } from '../todo.service';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html'
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  editingId: string | null = null;

  constructor(private todoService: TodoService) {}

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
