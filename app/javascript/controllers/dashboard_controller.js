import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="dashboard"
export default class extends Controller {
  static targets = [ "currentTime", "timeInput", "startingTime", "localTime", "timeTracked", "breakCheckbox", "endTime" ]
  static outlets = [ "notification" ]

  connect() {
    console.log("dashboard_controller connected")
    this.endTimeOffsetMinutes = 0;
    this.updateTime()
    this.interval = setInterval(() => {
      this.updateTime()
    }, 1000);

    const savedTime = localStorage.getItem('startingTime');
    if (savedTime && savedTime !== "--:--") {
      this.startingTimeTarget.textContent = savedTime;
      this.timeInputTarget.value = savedTime;
      this.startNotificationTimer(savedTime);
    }

    if(this.breakCheckboxTarget.checked) {
      this.breakCheckboxTarget.checked = true;
    }
    
    const breakCheckboxState = localStorage.getItem('breakCheckboxState') === 'true';
    this.breakCheckboxTarget.checked = breakCheckboxState;
  }

  disconnect() {
    clearInterval(this.interval)
  }

  updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}:${seconds}`;
    this.currentTimeTarget.textContent = currentTime;

    const startingTime = this.startingTimeTarget.textContent;
    if (startingTime != "--:--") {
      this.timeTrackedCalculation();
      this.updateEndTime();
    }
  }

  saveInputTime() {
    console.log("saveInputTime")
    const timeInput = this.timeInputTarget.value;
    this.startingTimeTarget.textContent = timeInput;
    localStorage.setItem('startingTime', timeInput);
    this.startNotificationTimer(timeInput);
  }

  startNotificationTimer(startTime) {
    if (this.hasNotificationOutlet) {
      this.notificationOutlet.startNotificationTimer(startTime);
    }
  }

  timeTrackedCalculation() {
    const startingTime = this.startingTimeTarget.textContent;
    if (startingTime) {
      const [startingHours, startingMinutes] = startingTime.split(':').map(Number);
      const startingDate = new Date();
      startingDate.setHours(startingHours, startingMinutes, 0, 0);

      const currentDate = new Date();

      let elapsedMilliseconds = currentDate - startingDate;
      if(this.breakCheckboxTarget.checked) {
        elapsedMilliseconds -= 60 * 60 * 1000;
      }

      const elapsedMinutes = Math.floor(elapsedMilliseconds / (1000 * 60));
      const elapsedHours = Math.floor(elapsedMinutes / 60);
      const remainingMinutes = elapsedMinutes % 60;
      if(elapsedHours < 0) {
        this.timeTrackedTarget.textContent = `${remainingMinutes}m`;
      } else {
        this.timeTrackedTarget.textContent = `${elapsedHours}h ${remainingMinutes}m`;
      }
    }
  }

  toggleBreakCheckbox() {
    const isChecked = this.breakCheckboxTarget.checked;
    localStorage.setItem('breakCheckboxState', isChecked);
  }

  add30minToEndTime() {
    this.endTimeOffsetMinutes = (this.endTimeOffsetMinutes || 0) + 30;
    this.updateEndTime();
  }

  add1hToEndTime() {
    this.endTimeOffsetMinutes = (this.endTimeOffsetMinutes || 0) + 60;
    this.updateEndTime();
  }

  resetEndTimeOffset() {
    this.endTimeOffsetMinutes = 0;
    this.updateEndTime();
  }

  _addMinutesToEndTime(minutes) {
    const endTimeEl = this.endTimeTarget;
    let timeStr = endTimeEl.textContent.trim();
    if (!/^\d{2}:\d{2}$/.test(timeStr)) return;
    let [h, m] = timeStr.split(':').map(Number);
    let date = new Date();
    date.setHours(h, m + minutes, 0, 0);
    let newH = String(date.getHours()).padStart(2, '0');
    let newM = String(date.getMinutes()).padStart(2, '0');
    endTimeEl.textContent = `${newH}:${newM}`;
  }

  updateEndTime() {
    const startingTime = this.startingTimeTarget.textContent;
    if (startingTime) {
      const [startingHours, startingMinutes] = startingTime.split(':').map(Number);
      const startingDate = new Date();
      startingDate.setHours(startingHours, startingMinutes, 0, 0);

      const offset = this.endTimeOffsetMinutes || 0;
      const endDate = new Date(startingDate.getTime() + (9 * 60 + offset) * 60 * 1000);
      const endHours = String(endDate.getHours()).padStart(2, '0');
      const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
      this.endTimeTarget.textContent = `${endHours}:${endMinutes}`;
    }
  }
}