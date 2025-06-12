import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-todo-input',
  templateUrl: "./todo-input.component.html",
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
