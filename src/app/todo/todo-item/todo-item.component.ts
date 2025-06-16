import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Todo } from '../todo.service';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-item.component.html',
})
export class TodoItemComponent {
  @Input() todo!: Todo;
  @Input() editingId: string | null = null;
  @Output() delete = new EventEmitter<string>();
  @Output() update = new EventEmitter<Todo>();
  @Output() startEdit = new EventEmitter<Todo>();
  @Output() finishEdit = new EventEmitter<Todo>();
  editedText: string = '';

  //so sánh ID, trùng thì sửa
  ngOnChanges() {
    if (this.editingId === this.todo.id) {
      this.editedText = this.todo.text;
    }
  }

  onDelete() {
    this.delete.emit(this.todo.id!);
  }

  onStartEdit() {
    this.startEdit.emit(this.todo);
  }

  onCancelEdit() {
    this.finishEdit.emit(undefined);
  }

  //trim() kiểm tra editedText có rỗng không, && kiểm tra xem có khác ban đầu không.
  //...this.todo tạo shallow copy của this.todo và ghi đè thuộc tính text; else phát ra undefined để hủy việc lưu.
  onSaveEdit() {
    if (this.editedText.trim() && this.editedText !== this.todo.text) {
      this.finishEdit.emit({ ...this.todo, text: this.editedText });
    } else {
      this.finishEdit.emit(undefined);
    }
  }

  onCheckboxChange() {
    this.update.emit({ ...this.todo, completed: !this.todo.completed });
  }
}
