import { Component, OnInit } from '@angular/core';
import { TodoService, Todo } from '../todo.service';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html'
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  editingId: string | null = null;
  loading = false;
  error: string | null = null;

  constructor(private todoService: TodoService) {}

  ngOnInit() {
    this.loadTodos();
  }

  loadTodos() {
    this.loading = true;
    this.error = null;
    
    this.todoService.getTodos().subscribe({
      next: (todos) => {
        this.todos = todos;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading todos:', error);
        this.error = 'Failed to load todos';
        this.loading = false;
      }
    });
  }

  deleteTask(id: string) {
    this.todoService.deleteTodo(id)
      .then(() => {
        console.log('Todo deleted successfully');
      })
      .catch(error => {
        console.error('Error deleting todo:', error);
        this.error = 'Failed to delete todo';
      });
  }

  updateTask(todo: Todo) {
    this.todoService.updateTodo(todo)
      .then(() => {
        console.log('Todo updated successfully');
      })
      .catch(error => {
        console.error('Error updating todo:', error);
        this.error = 'Failed to update todo';
      });
  }

  startEdit(todo: Todo) {
    this.editingId = todo.id!;
  }

  finishEdit(todo: Todo | null) {
    if (todo) {
      this.updateTask(todo);
    }
    this.editingId = null;
  }

  // Thêm method để handle add todo từ input component
  addTask(text: string) {
    this.todoService.addTodo(text).subscribe({
      next: () => {
        console.log('Todo added successfully');
      },
      error: (error) => {
        console.error('Error adding todo:', error);
        this.error = 'Failed to add todo';
      }
    });
  }
}