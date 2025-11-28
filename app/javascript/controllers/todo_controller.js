import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="todo"
export default class extends Controller {
  static targets = ["inputTodo", "incompleteLists", "completeLists"]

  connect() {
    this.loadTodos()
  }

  addTodo() {
    const inputTodo = this.inputTodoTarget.value
    if (!inputTodo.trim()) return

    this.createIncompleteTodo(inputTodo)
    this.inputTodoTarget.value = ''
    this.saveTodos()
  }

  createIncompleteTodo(todo) {
    const { li, div } = this.createTodoElement(todo)

    const completeButton = this.createButton('Complete', 'bg-blue-300 hover:bg-blue-500', () => {
      this.moveToComplete(li, div)
    })

    const deleteButton = this.createButton('Delete', 'bg-red-300 hover:bg-red-500', () => {
      this.incompleteListsTarget.removeChild(li)
      this.saveTodos()
    })

    div.appendChild(completeButton)
    div.appendChild(deleteButton)
    this.incompleteListsTarget.appendChild(li)
  }

  createCompleteTodo(todo) {
    const { li, div } = this.createTodoElement(todo)

    const backButton = this.createBackButton(li)
    div.appendChild(backButton)
    this.completeListsTarget.appendChild(li)
  }

  createTodoElement(todo) {
    const li = document.createElement('li')
    li.className = 'flex items-center justify-between'

    const p = document.createElement('p')
    p.className = 'flex-grow my-3'
    p.innerText = todo

    const div = document.createElement('div')
    div.className = 'flex-shrink-0'

    li.appendChild(p)
    li.appendChild(div)

    return { li, p, div }
  }

  createButton(text, colorClass, onClick) {
    const button = document.createElement('button')
    button.className = `ml-2 px-4 py-1 ${colorClass} text-white rounded-md`
    button.innerText = text
    button.addEventListener('click', onClick)
    return button
  }

  createBackButton(li) {
    return this.createButton('back', 'bg-blue-300 hover:bg-blue-500', () => {
      const todoText = li.querySelector('p').innerText
      this.createIncompleteTodo(todoText)
      this.completeListsTarget.removeChild(li)
      this.saveTodos()
    })
  }

  moveToComplete(li, div) {
    // 既存のボタンを削除
    div.innerHTML = ''

    const backButton = this.createBackButton(li)
    div.appendChild(backButton)
    this.completeListsTarget.appendChild(li)
    this.saveTodos()
  }

  saveTodos() {
    const incompleteTodos = Array.from(this.incompleteListsTarget.children).map(li => li.querySelector('p').innerText)
    const completeTodos = Array.from(this.completeListsTarget.children).map(li => li.querySelector('p').innerText)
    localStorage.setItem('incompleteTodos', JSON.stringify(incompleteTodos))
    localStorage.setItem('completeTodos', JSON.stringify(completeTodos))
  }

  loadTodos() {
    const incompleteTodos = JSON.parse(localStorage.getItem('incompleteTodos')) || []
    const completeTodos = JSON.parse(localStorage.getItem('completeTodos')) || []

    incompleteTodos.forEach(todo => this.createIncompleteTodo(todo))
    completeTodos.forEach(todo => this.createCompleteTodo(todo))
  }
}
