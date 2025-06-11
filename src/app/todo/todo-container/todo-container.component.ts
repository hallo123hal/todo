import { Component } from '@angular/core';
import { TodoService } from '../todo.service';

@Component({
  selector: 'app-todo-container',
  templateUrl: './todo-container.component.html'
})
export class TodoContainerComponent {
  constructor(public todoService: TodoService) {}
}