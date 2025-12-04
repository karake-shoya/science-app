import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["currentTime", "timeInput", "startingTime", "localTime", "timeTracked", "breakCheckbox", "endTime"]
  static outlets = ["notification"]

  static STORAGE_KEYS = {
    startingTime: 'startingTime',
    breakCheckbox: 'breakCheckboxState'
  }

  static TIME = {
    ONE_HOUR_MS: 60 * 60 * 1000,
    ONE_MINUTE_MS: 60 * 1000,
    WORK_HOURS: 9
  }

  connect() {
    this.endTimeOffsetMinutes = 0
    this.restoreBreakCheckboxState()
    this.restoreStartingTime()
    this.startClock()
  }

  disconnect() {
    clearInterval(this.interval)
  }

  // 時計の開始
  startClock() {
    this.updateTime()
    this.interval = setInterval(() => this.updateTime(), 1000)
  }

  // 現在時刻の更新
  updateTime() {
    this.currentTimeTarget.textContent = this.formatTime(new Date())

    if (this.hasValidStartingTime()) {
      this.updateTimeTracked()
      this.updateEndTime()
    }
  }

  // 開始時刻の保存
  saveInputTime() {
    const timeInput = this.timeInputTarget.value
    this.startingTimeTarget.textContent = timeInput
    localStorage.setItem(this.constructor.STORAGE_KEYS.startingTime, timeInput)
    this.updateTimeTracked()
    this.updateEndTime()
    this.startNotificationTimer(timeInput)
  }

  // 休憩チェックボックスの切り替え
  toggleBreakCheckbox() {
    localStorage.setItem(
      this.constructor.STORAGE_KEYS.breakCheckbox,
      this.breakCheckboxTarget.checked
    )
  }

  // 終了時刻の調整
  add30minToEndTime() {
    this.addEndTimeOffset(30)
  }

  add1hToEndTime() {
    this.addEndTimeOffset(60)
  }

  resetEndTimeOffset() {
    this.endTimeOffsetMinutes = 0
    this.updateEndTime()
  }

  // === Private Methods ===

  restoreBreakCheckboxState() {
    const state = localStorage.getItem(this.constructor.STORAGE_KEYS.breakCheckbox)
    this.breakCheckboxTarget.checked = state === 'true'
  }

  restoreStartingTime() {
    const savedTime = localStorage.getItem(this.constructor.STORAGE_KEYS.startingTime)
    if (savedTime && savedTime !== "--:--") {
      this.startingTimeTarget.textContent = savedTime
      this.timeInputTarget.value = savedTime
      this.startNotificationTimer(savedTime)
    }
  }

  startNotificationTimer(startTime) {
    if (this.hasNotificationOutlet) {
      this.notificationOutlet.startNotificationTimer(startTime)
    }
  }

  hasValidStartingTime() {
    return this.startingTimeTarget.textContent !== "--:--"
  }

  updateTimeTracked() {
    const startingTime = this.startingTimeTarget.textContent
    if (!startingTime) return

    const startDate = this.parseTimeToDate(startingTime)
    let elapsedMs = Date.now() - startDate.getTime()

    if (this.breakCheckboxTarget.checked) {
      elapsedMs -= this.constructor.TIME.ONE_HOUR_MS
    }

    this.timeTrackedTarget.textContent = this.formatElapsedTime(elapsedMs)
  }

  updateEndTime() {
    const startingTime = this.startingTimeTarget.textContent
    if (!startingTime) return

    const startDate = this.parseTimeToDate(startingTime)
    const { WORK_HOURS, ONE_MINUTE_MS } = this.constructor.TIME
    const offset = this.endTimeOffsetMinutes || 0
    const endDate = new Date(startDate.getTime() + (WORK_HOURS * 60 + offset) * ONE_MINUTE_MS)

    this.endTimeTarget.textContent = this.formatTime(endDate, false)
  }

  addEndTimeOffset(minutes) {
    this.endTimeOffsetMinutes = (this.endTimeOffsetMinutes || 0) + minutes
    this.updateEndTime()
  }

  // === Utility Methods ===

  parseTimeToDate(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  formatTime(date, includeSeconds = true) {
    const h = String(date.getHours()).padStart(2, '0')
    const m = String(date.getMinutes()).padStart(2, '0')
    if (!includeSeconds) return `${h}:${m}`
    const s = String(date.getSeconds()).padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  formatElapsedTime(ms) {
    const totalMinutes = Math.floor(ms / this.constructor.TIME.ONE_MINUTE_MS)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return hours < 0 ? `${minutes}m` : `${hours}h ${minutes}m`
  }
}

