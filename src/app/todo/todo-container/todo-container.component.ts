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

  // Method để handle add task từ input component
  onAddTask(text: string) {
    // Gọi addTask method từ todo-list component
    if (this.todoListComponent) {
      this.todoListComponent.addTask(text);
    }
  }
}