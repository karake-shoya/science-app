import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="theme"
export default class extends Controller {
  static targets = ["icon"]

  connect() {
    this.applyTheme(this.currentTheme)
  }

  toggle() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark'
    this.applyTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      this.updateIcon('🌙')
    } else {
      document.documentElement.classList.remove('dark')
      this.updateIcon('☀️')
    }
  }

  updateIcon(icon) {
    if (this.hasIconTarget) {
      this.iconTarget.textContent = icon
    }
  }

  get currentTheme() {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) return savedTheme

    // システム設定を確認
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }
}
