import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="todo"
export default class extends Controller {
  static targets = ["inputTodo", "incompleteLists", "completeLists"]

  connect() {
    console.log("todo_controller connected")
    this.loadTodos();
  }

  addTodo() {
    console.log("addTodo")
    const inputTodo = this.inputTodoTarget.value;
    console.log(inputTodo)
    this.createIncompleteTodo(inputTodo);
    this.inputTodoTarget.value = '';
    this.saveTodos();
  }

  createIncompleteTodo(todo) {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between';

    const p = document.createElement('p');
    p.className = 'flex-grow my-3';
    p.innerText = todo;

    const div = document.createElement('div');
    div.className = 'flex-shrink-0';

    const completeButton = document.createElement('button');
    completeButton.className = 'ml-2 px-4 py-1 bg-blue-300 text-white rounded-md hover:bg-blue-500';
    completeButton.innerText = 'Complete';
    completeButton.addEventListener('click', () => {
      const moveTarget = completeButton.closest('li');
      completeButton.nextElementSibling.remove();
      completeButton.remove();
      const backButton = document.createElement('button');
      backButton.className = 'ml-2 px-4 py-1 bg-blue-300 text-white rounded-md hover:bg-blue-500';
      backButton.innerText = 'back';
      backButton.addEventListener('click', () => {
        const todoText = backButton.closest('li').querySelector('p').innerText;
        this.createIncompleteTodo(todoText);
        this.completeListsTarget.removeChild(backButton.closest('li'));
      });
      div.appendChild(backButton);
      this.completeListsTarget.appendChild(moveTarget);
      this.saveTodos();
    });

    const deleteButton = document.createElement('button');
    deleteButton.className = 'ml-2 px-4 py-1 bg-red-300 text-white rounded-md hover:bg-red-500';
    deleteButton.innerText = 'Delete';
    deleteButton.addEventListener('click', () => {
      const deleteTarget = deleteButton.closest('li');
      this.incompleteListsTarget.removeChild(deleteTarget);
      this.saveTodos();
    });

    li.appendChild(p);
    li.appendChild(div);
    div.appendChild(completeButton);
    div.appendChild(deleteButton);
    this.incompleteListsTarget.appendChild(li);
  }

  saveTodos() {
    const incompleteTodos = Array.from(this.incompleteListsTarget.children).map(li => li.querySelector('p').innerText);
    const completeTodos = Array.from(this.completeListsTarget.children).map(li => li.querySelector('p').innerText);
    localStorage.setItem('incompleteTodos', JSON.stringify(incompleteTodos));
    localStorage.setItem('completeTodos', JSON.stringify(completeTodos));
  }

  loadTodos() {
    const incompleteTodos = JSON.parse(localStorage.getItem('incompleteTodos')) || [];
    const completeTodos = JSON.parse(localStorage.getItem('completeTodos')) || [];

    incompleteTodos.forEach(todo => this.createIncompleteTodo(todo));
    completeTodos.forEach(todo => {
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between';

      const p = document.createElement('p');
      p.className = 'flex-grow my-3';
      p.innerText = todo;

      const div = document.createElement('div');
      div.className = 'flex-shrink-0';

      const backButton = document.createElement('button');
      backButton.className = 'ml-2 px-4 py-1 bg-blue-300 text-white rounded-md hover:bg-blue-500';
      backButton.innerText = 'back';
      backButton.addEventListener('click', () => {
        const todoText = backButton.closest('li').querySelector('p').innerText;
        this.createIncompleteTodo(todoText);
        this.completeListsTarget.removeChild(backButton.closest('li'));
        this.saveTodos();
      });

      li.appendChild(p);
      li.appendChild(div);
      div.appendChild(backButton);
      this.completeListsTarget.appendChild(li);
    });
  }
}

document.getElementById('add-button').addEventListener('click', (event) => {
  const controller = event.currentTarget.closest('[data-controller="todo"]').controller;
  controller.addTodo();
});