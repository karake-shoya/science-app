import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="time-picker"
export default class extends Controller {
  static targets = ["display", "dropdown", "hourList", "minuteList", "hiddenInput"]
  static values = {
    hour: { type: Number, default: 9 },
    minute: { type: Number, default: 0 }
  }

  connect() {
    this.isOpen = false
    this.updateDisplay()
    document.addEventListener('click', this.handleClickOutside.bind(this))
  }

  disconnect() {
    document.removeEventListener('click', this.handleClickOutside.bind(this))
  }

  toggle(event) {
    event.stopPropagation()
    this.isOpen ? this.close() : this.open()
  }

  open() {
    this.isOpen = true
    this.dropdownTarget.classList.remove('hidden', 'opacity-0', 'scale-95')
    this.dropdownTarget.classList.add('opacity-100', 'scale-100')
    this.scrollToSelected()
  }

  close() {
    this.isOpen = false
    this.dropdownTarget.classList.add('opacity-0', 'scale-95')
    setTimeout(() => {
      if (!this.isOpen) {
        this.dropdownTarget.classList.add('hidden')
      }
    }, 150)
  }

  handleClickOutside(event) {
    if (!this.element.contains(event.target)) {
      this.close()
    }
  }

  selectHour(event) {
    const hour = parseInt(event.currentTarget.dataset.hour)
    this.hourValue = hour
    this.updateDisplay()
    this.highlightSelected()
  }

  selectMinute(event) {
    const minute = parseInt(event.currentTarget.dataset.minute)
    this.minuteValue = minute
    this.updateDisplay()
    this.highlightSelected()
  }

  updateDisplay() {
    const hourStr = String(this.hourValue).padStart(2, '0')
    const minuteStr = String(this.minuteValue).padStart(2, '0')
    this.displayTarget.textContent = `${hourStr}:${minuteStr}`
    
    if (this.hasHiddenInputTarget) {
      this.hiddenInputTarget.value = `${hourStr}:${minuteStr}`
    }
  }

  scrollToSelected() {
    // 選択中の時間までスクロール
    const selectedHour = this.hourListTarget.querySelector(`[data-hour="${this.hourValue}"]`)
    const selectedMinute = this.minuteListTarget.querySelector(`[data-minute="${this.minuteValue}"]`)
    
    if (selectedHour) {
      selectedHour.scrollIntoView({ block: 'center', behavior: 'instant' })
    }
    if (selectedMinute) {
      selectedMinute.scrollIntoView({ block: 'center', behavior: 'instant' })
    }
    
    this.highlightSelected()
  }

  highlightSelected() {
    // 時間のハイライト
    this.hourListTarget.querySelectorAll('button').forEach(btn => {
      const isSelected = parseInt(btn.dataset.hour) === this.hourValue
      btn.classList.toggle('bg-indigo-500', isSelected)
      btn.classList.toggle('dark:bg-cyan-600', isSelected)
      btn.classList.toggle('text-white', isSelected)
      btn.classList.toggle('text-slate-700', !isSelected)
      btn.classList.toggle('dark:text-slate-200', !isSelected)
    })

    // 分のハイライト
    this.minuteListTarget.querySelectorAll('button').forEach(btn => {
      const isSelected = parseInt(btn.dataset.minute) === this.minuteValue
      btn.classList.toggle('bg-indigo-500', isSelected)
      btn.classList.toggle('dark:bg-cyan-600', isSelected)
      btn.classList.toggle('text-white', isSelected)
      btn.classList.toggle('text-slate-700', !isSelected)
      btn.classList.toggle('dark:text-slate-200', !isSelected)
    })
  }

  // 現在時刻をセット
  setNow() {
    const now = new Date()
    this.hourValue = now.getHours()
    this.minuteValue = Math.floor(now.getMinutes() / 5) * 5 // 5分単位に丸める
    this.updateDisplay()
    this.scrollToSelected()
  }

  // 値を取得（外部から呼び出し用）
  getValue() {
    const hourStr = String(this.hourValue).padStart(2, '0')
    const minuteStr = String(this.minuteValue).padStart(2, '0')
    return `${hourStr}:${minuteStr}`
  }
}

