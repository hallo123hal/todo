import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoService } from '../todo.service';
import { TodoListComponent } from '../todo-list/todo-list.component';
import { TodoInputComponent } from '../todo-input/todo-input.component';

@Component({
  selector: 'app-todo-container',
  standalone: true,
  imports: [CommonModule, TodoListComponent, TodoInputComponent],
  templateUrl: './todo-container.component.html'
})
export class TodoContainerComponent {
  // cho phép tương tác với child component TodoListComponent
  @ViewChild(TodoListComponent) todoListComponent!: TodoListComponent;

  constructor(public todoService: TodoService) {}

  onAddTask(text: string) {
    if (this.todoListComponent) {
      this.todoListComponent.addTask(text);
    }
  }
}