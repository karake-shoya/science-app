import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="clipboard"
export default class extends Controller {
  static targets = ["notification"]

  async copy(event) {
    const text = event.currentTarget.dataset.clipboardText
    try {
      await navigator.clipboard.writeText(text)
      this.showNotification()
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  showNotification() {
    if (this.hasNotificationTarget) {
      this.notificationTarget.classList.remove('translate-y-20', 'opacity-0')
      this.notificationTarget.classList.add('translate-y-0', 'opacity-100')

      setTimeout(() => {
        this.notificationTarget.classList.add('translate-y-20', 'opacity-0')
        this.notificationTarget.classList.remove('translate-y-0', 'opacity-100')
      }, 2000)
    }
  }
}

