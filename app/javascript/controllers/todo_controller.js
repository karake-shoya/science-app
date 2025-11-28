import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="todo"
export default class extends Controller {
  static targets = ["inputTodo", "incompleteLists", "completeLists"]

  connect() {
    this.loadTodos()
  }

  async addTodo() {
    const inputTodo = this.inputTodoTarget.value
    if (!inputTodo.trim()) return

    try {
      const response = await this.apiRequest('/todos', 'POST', { todo: { content: inputTodo } })
      if (response.ok) {
        const todo = await response.json()
        this.createIncompleteTodo(todo.content, todo.id)
        this.inputTodoTarget.value = ''
      }
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  }

  createIncompleteTodo(content, id) {
    const { li, div } = this.createTodoElement(content, id)

    const completeButton = this.createButton('Complete', 'bg-blue-300 hover:bg-blue-500', () => {
      this.moveToComplete(li, div, id)
    })

    const deleteButton = this.createButton('Delete', 'bg-red-300 hover:bg-red-500', () => {
      this.deleteTodo(li, id)
    })

    div.appendChild(completeButton)
    div.appendChild(deleteButton)
    this.incompleteListsTarget.appendChild(li)
  }

  createCompleteTodo(content, id) {
    const { li, div } = this.createTodoElement(content, id)

    const backButton = this.createBackButton(li, id)
    div.appendChild(backButton)
    this.completeListsTarget.appendChild(li)
  }

  createTodoElement(content, id) {
    const li = document.createElement('li')
    li.className = 'flex items-center justify-between'
    li.dataset.todoId = id

    const p = document.createElement('p')
    p.className = 'flex-grow my-3'
    p.innerText = content

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

  createBackButton(li, id) {
    return this.createButton('back', 'bg-blue-300 hover:bg-blue-500', () => {
      this.moveToIncomplete(li, id)
    })
  }

  async moveToComplete(li, div, id) {
    try {
      const response = await this.apiRequest(`/todos/${id}`, 'PATCH', { todo: { completed: true } })
      if (response.ok) {
        div.innerHTML = ''
        const backButton = this.createBackButton(li, id)
        div.appendChild(backButton)
        this.completeListsTarget.appendChild(li)
      }
    } catch (error) {
      console.error('Failed to complete todo:', error)
    }
  }

  async moveToIncomplete(li, id) {
    try {
      const response = await this.apiRequest(`/todos/${id}`, 'PATCH', { todo: { completed: false } })
      if (response.ok) {
        const content = li.querySelector('p').innerText
        li.remove()
        this.createIncompleteTodo(content, id)
      }
    } catch (error) {
      console.error('Failed to uncomplete todo:', error)
    }
  }

  async deleteTodo(li, id) {
    try {
      const response = await this.apiRequest(`/todos/${id}`, 'DELETE')
      if (response.ok) {
        li.remove()
      }
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  async loadTodos() {
    try {
      const response = await this.apiRequest('/todos', 'GET')
      if (response.ok) {
        const data = await response.json()
        data.incomplete.forEach(todo => this.createIncompleteTodo(todo.content, todo.id))
        data.complete.forEach(todo => this.createCompleteTodo(todo.content, todo.id))
      }
    } catch (error) {
      console.error('Failed to load todos:', error)
    }
  }

  async apiRequest(url, method, body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': this.csrfToken
      }
    }
    if (body) {
      options.body = JSON.stringify(body)
    }
    return fetch(url, options)
  }

  get csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content
  }
}
