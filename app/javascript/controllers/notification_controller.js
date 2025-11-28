import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["toast", "toastMessage", "toastIcon", "permissionButton", "enableToggle"]

  connect() {
    this.notifiedHours = new Set()
    this.notifiedTenMinBefore = false
    this.notifiedEndTime = false
    this.audioContext = null

    this.loadSettings()
    this.checkNotificationPermission()
  }

  disconnect() {
    this.stopNotificationTimer()
  }

  loadSettings() {
    const settings = localStorage.getItem('notificationSettings')
    if (settings) {
      const parsed = JSON.parse(settings)
      this.enabled = parsed.enabled !== false
      this.soundEnabled = parsed.soundEnabled !== false
      this.browserEnabled = parsed.browserEnabled !== false
    } else {
      this.enabled = true
      this.soundEnabled = true
      this.browserEnabled = true
    }

    if (this.hasEnableToggleTarget) {
      this.enableToggleTarget.checked = this.enabled
    }
  }

  saveSettings() {
    const settings = {
      enabled: this.enabled,
      soundEnabled: this.soundEnabled,
      browserEnabled: this.browserEnabled
    }
    localStorage.setItem('notificationSettings', JSON.stringify(settings))
  }

  toggleEnabled(event) {
    this.enabled = event.target.checked
    this.saveSettings()
  }

  checkNotificationPermission() {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications")
      return
    }

    if (this.hasPermissionButtonTarget) {
      if (Notification.permission === "granted") {
        this.permissionButtonTarget.classList.add("hidden")
      } else if (Notification.permission === "denied") {
        this.permissionButtonTarget.textContent = "通知がブロックされています"
        this.permissionButtonTarget.disabled = true
      }
    }
  }

  requestPermission() {
    if (!("Notification" in window)) return

    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        this.showToast("通知が有効になりました！", "success")
        if (this.hasPermissionButtonTarget) {
          this.permissionButtonTarget.classList.add("hidden")
        }
      }
    })
  }

  startNotificationTimer(startTime) {
    this.stopNotificationTimer()

    this.notifiedHours.clear()
    this.notifiedTenMinBefore = false
    this.notifiedEndTime = false

    this.startingTime = startTime
    this.notificationInterval = setInterval(() => {
      this.checkNotifications()
    }, 1000)
  }

  stopNotificationTimer() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval)
      this.notificationInterval = null
    }
  }

  checkNotifications() {
    if (!this.enabled || !this.startingTime) return

    const [startHours, startMinutes] = this.startingTime.split(':').map(Number)
    const startDate = new Date()
    startDate.setHours(startHours, startMinutes, 0, 0)

    const now = new Date()
    const elapsedMs = now - startDate
    const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60))
    const elapsedHours = Math.floor(elapsedMinutes / 60)

    for (let hour = 1; hour <= 8; hour++) {
      const hourInMinutes = hour * 60
      if (elapsedMinutes >= hourInMinutes && !this.notifiedHours.has(hour)) {
        this.notifiedHours.add(hour)
        this.notify(`勤務開始から${hour}時間が経過しました`, "hourly", hour)
      }
    }

    const endTimeMinutes = 9 * 60
    const tenMinBeforeEnd = endTimeMinutes - 10

    if (elapsedMinutes >= tenMinBeforeEnd && elapsedMinutes < endTimeMinutes && !this.notifiedTenMinBefore) {
      this.notifiedTenMinBefore = true
      this.notify("終業時間10分前です", "warning")
    }

    if (elapsedMinutes >= endTimeMinutes && !this.notifiedEndTime) {
      this.notifiedEndTime = true
      this.notify("お疲れさまでした！終業時間です", "end")
    }
  }

  notify(message, type, hour = null) {
    this.showToast(message, type, hour)

    if (this.soundEnabled) {
      this.playSound(type)
    }

    if (this.browserEnabled && Notification.permission === "granted") {
      this.showBrowserNotification(message, type, hour)
    }
  }

  showToast(message, type, hour = null) {
    if (!this.hasToastTarget) return

    const toast = this.toastTarget
    const messageEl = this.toastMessageTarget
    const iconEl = this.toastIconTarget

    let icon, bgClass, borderClass
    switch (type) {
      case "hourly":
        icon = this.getHourIcon(hour)
        bgClass = "bg-blue-50 dark:bg-blue-900/30"
        borderClass = "border-blue-300 dark:border-blue-700"
        break
      case "warning":
        icon = "⚠️"
        bgClass = "bg-amber-50 dark:bg-amber-900/30"
        borderClass = "border-amber-300 dark:border-amber-700"
        break
      case "end":
        icon = "🏠"
        bgClass = "bg-emerald-50 dark:bg-emerald-900/30"
        borderClass = "border-emerald-300 dark:border-emerald-700"
        break
      case "success":
        icon = "✅"
        bgClass = "bg-emerald-50 dark:bg-emerald-900/30"
        borderClass = "border-emerald-300 dark:border-emerald-700"
        break
      default:
        icon = "🔔"
        bgClass = "bg-slate-50 dark:bg-slate-700/30"
        borderClass = "border-slate-300 dark:border-slate-600"
    }

    toast.className = `fixed top-20 right-4 z-50 p-4 rounded-xl shadow-lg border-2 ${bgClass} ${borderClass} transform transition-all duration-300 ease-out`

    iconEl.textContent = icon
    messageEl.textContent = message

    toast.classList.remove("translate-x-full", "opacity-0")
    toast.classList.add("translate-x-0", "opacity-100")

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout)
    }

    this.toastTimeout = setTimeout(() => {
      this.hideToast()
    }, 5000)
  }

  hideToast() {
    if (!this.hasToastTarget) return

    const toast = this.toastTarget
    toast.classList.remove("translate-x-0", "opacity-100")
    toast.classList.add("translate-x-full", "opacity-0")
  }

  getHourIcon(hour) {
    const icons = {
      1: "🕐", 2: "🕑", 3: "🕒", 4: "🕓",
      5: "🕔", 6: "🕕", 7: "🕖", 8: "🕗"
    }
    return icons[hour] || "🕐"
  }

  playSound(type) {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      }

      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      let frequency, duration
      switch (type) {
        case "hourly":
          frequency = 523.25
          duration = 0.15
          break
        case "warning":
          frequency = 440
          duration = 0.3
          break
        case "end":
          frequency = 659.25
          duration = 0.4
          break
        default:
          frequency = 523.25
          duration = 0.15
      }

      oscillator.frequency.value = frequency
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration)

      if (type === "end") {
        setTimeout(() => this.playChime(659.25), 200)
        setTimeout(() => this.playChime(783.99), 400)
      }
    } catch (e) {
      console.log("Audio playback failed:", e)
    }
  }

  playChime(frequency) {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.3)
  }

  showBrowserNotification(message, type, hour = null) {
    const icon = type === "hourly" ? this.getHourIcon(hour) : type === "warning" ? "⚠️" : "🏠"

    new Notification("ScienceApp", {
      body: message,
      icon: "/icon.png",
      tag: `notification-${type}-${hour || ""}`,
      requireInteraction: type === "end"
    })
  }

  testNotification() {
    this.notify("これはテスト通知です", "hourly", 1)
  }
}

