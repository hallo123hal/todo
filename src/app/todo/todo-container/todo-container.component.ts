import { Component, ViewChild } from '@angular/core';
import { TodoService } from '../todo.service';
import { TodoListComponent } from '../todo-list/todo-list.component';

@Component({
  selector: 'app-todo-container',
  templateUrl: './todo-container.component.html'
})
export class TodoContainerComponent {
  @ViewChild(TodoListComponent) todoListComponent!: TodoListComponent;

  constructor(public todoService: TodoService) {}

  onAddTask(text: string) {
    if (this.todoListComponent) {
      this.todoListComponent.addTask(text);
    }
  }
}