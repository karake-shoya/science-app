import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="dashboard"
export default class extends Controller {
  static targets = [ "currentTime", "timeInput", "startingTime","localTime", "timeTracked", "breakCheckbox" ]

  connect() {
    console.log("dashboard_controller connected")
    this.updateTime()
    this.interval = setInterval(() => {
      this.updateTime()
    }, 1000);

    if (this.startingTarget != "--:--"){
      const savedTime = localStorage.getItem('startingTime');
      this.startingTimeTarget.textContent = savedTime;
      this.timeInputTarget.value = savedTime;
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
    }
  }

  saveInputTime() {
    console.log("saveInputTime")
    const timeInput = this.timeInputTarget.value;
    this.startingTimeTarget.textContent = timeInput;
    localStorage.setItem('startingTime', timeInput);
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
}