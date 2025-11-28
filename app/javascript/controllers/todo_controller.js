import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="todo"
export default class extends Controller {
  static targets = ["inputTodo", "incompleteLists", "completeLists", "errorMessage", "loading"]

  connect() {
    this.loadTodos()
  }

  showError(message) {
    if (this.hasErrorMessageTarget) {
      this.errorMessageTarget.textContent = message
      this.errorMessageTarget.classList.remove('hidden')
      setTimeout(() => {
        this.errorMessageTarget.classList.add('hidden')
      }, 5000)
    }
  }

  showLoading(show) {
    if (this.hasLoadingTarget) {
      if (show) {
        this.loadingTarget.classList.remove('hidden')
      } else {
        this.loadingTarget.classList.add('hidden')
      }
    }
  }

  async addTodo() {
    const inputTodo = this.inputTodoTarget.value
    if (!inputTodo.trim()) {
      this.showError('TODOの内容を入力してください')
      return
    }

    try {
      const response = await this.apiRequest('/todos', 'POST', { todo: { content: inputTodo } })
      if (response.ok) {
        const todo = await response.json()
        this.createIncompleteTodo(todo.content, todo.id)
        this.inputTodoTarget.value = ''
      } else {
        const error = await response.json()
        this.showError(error.errors?.join(', ') || 'TODOの追加に失敗しました')
      }
    } catch (error) {
      console.error('Failed to add todo:', error)
      this.showError('通信エラーが発生しました。再度お試しください')
    }
  }

  createIncompleteTodo(content, id) {
    const { li, div } = this.createTodoElement(content, id)

    const completeButton = this.createButton('✓', 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700', () => {
      this.moveToComplete(li, div, id)
    })

    const deleteButton = this.createButton('✕', 'bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700', () => {
      this.deleteTodo(li, id)
    })

    div.appendChild(completeButton)
    div.appendChild(deleteButton)
    this.incompleteListsTarget.appendChild(li)
  }

  createCompleteTodo(content, id) {
    const { li, div } = this.createTodoElement(content, id, true)

    const backButton = this.createBackButton(li, id)
    div.appendChild(backButton)
    this.completeListsTarget.appendChild(li)
  }

  createTodoElement(content, id, completed = false) {
    const li = document.createElement('li')
    li.className = 'flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-slate-600/50 hover:bg-white dark:hover:bg-slate-600 transition-colors'
    li.dataset.todoId = id

    const p = document.createElement('p')
    p.className = completed
      ? 'flex-grow text-slate-500 dark:text-slate-400 line-through'
      : 'flex-grow text-slate-700 dark:text-slate-200'
    p.innerText = content

    const div = document.createElement('div')
    div.className = 'flex-shrink-0 flex gap-1'

    li.appendChild(p)
    li.appendChild(div)

    return { li, p, div }
  }

  createButton(text, colorClass, onClick) {
    const button = document.createElement('button')
    button.className = `ml-1 px-3 py-1.5 ${colorClass} text-white rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md`
    button.innerText = text
    button.addEventListener('click', onClick)
    return button
  }

  createBackButton(li, id) {
    return this.createButton('↩', 'bg-indigo-500 hover:bg-indigo-600 dark:bg-cyan-600 dark:hover:bg-cyan-700', () => {
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
        // Update text style for completed
        const p = li.querySelector('p')
        p.className = 'flex-grow text-slate-500 dark:text-slate-400 line-through'
        this.completeListsTarget.appendChild(li)
      } else {
        this.showError('TODOの完了に失敗しました')
      }
    } catch (error) {
      console.error('Failed to complete todo:', error)
      this.showError('通信エラーが発生しました')
    }
  }

  async moveToIncomplete(li, id) {
    try {
      const response = await this.apiRequest(`/todos/${id}`, 'PATCH', { todo: { completed: false } })
      if (response.ok) {
        const content = li.querySelector('p').innerText
        li.remove()
        this.createIncompleteTodo(content, id)
      } else {
        this.showError('TODOの戻しに失敗しました')
      }
    } catch (error) {
      console.error('Failed to uncomplete todo:', error)
      this.showError('通信エラーが発生しました')
    }
  }

  async deleteTodo(li, id) {
    try {
      const response = await this.apiRequest(`/todos/${id}`, 'DELETE')
      if (response.ok) {
        li.remove()
      } else {
        this.showError('TODOの削除に失敗しました')
      }
    } catch (error) {
      console.error('Failed to delete todo:', error)
      this.showError('通信エラーが発生しました')
    }
  }

  async loadTodos() {
    this.showLoading(true)
    try {
      const response = await this.apiRequest('/todos', 'GET')
      if (response.ok) {
        const data = await response.json()
        data.incomplete.forEach(todo => this.createIncompleteTodo(todo.content, todo.id))
        data.complete.forEach(todo => this.createCompleteTodo(todo.content, todo.id))
      } else {
        this.showError('TODOの読み込みに失敗しました')
      }
    } catch (error) {
      console.error('Failed to load todos:', error)
      this.showError('通信エラーが発生しました。ページを再読み込みしてください')
    } finally {
      this.showLoading(false)
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
