import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoListComponent } from './todo-list/todo-list.component';
import { TodoInputComponent } from './todo-input/todo-input.component';
import { TodoItemComponent } from './todo-item/todo-item.component';
import { TodoContainerComponent } from './todo-container/todo-container.component';

@NgModule({
  declarations: [
    TodoListComponent, 
    TodoInputComponent, 
    TodoItemComponent,
    TodoContainerComponent
  ],
  imports: [CommonModule, FormsModule],
  exports: [
    TodoListComponent, 
    TodoInputComponent, 
    TodoItemComponent,
    TodoContainerComponent
  ]
})
export class TodoModule { }