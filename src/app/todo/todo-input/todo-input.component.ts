import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-input.component.html',
})
export class TodoInputComponent {
  task = '';
  @Output() addTask = new EventEmitter<string>();

  // hàm add() sẽ phát ra sự kiện addTask với giá trị của task
  add() {
    if (this.task.trim()) {
      this.addTask.emit(this.task.trim());
      this.task = '';
    }
  }
}
