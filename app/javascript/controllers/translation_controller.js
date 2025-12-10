import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "result", "status", "spinner", "error", "badge"]

  handlePaste(event) {
    const text = event.clipboardData?.getData("text")?.trim()
    if (!text) return

    event.preventDefault()
    this.inputTarget.value = text
    this.translate(text)
  }

  handleTranslate(event) {
    event?.preventDefault()
    const text = this.inputTarget.value.trim()
    if (!text) {
      this.showError("テキストを入れてね")
      return
    }
    this.translate(text)
  }

  async translate(text) {
    this.showError("")
    this.setStatus("翻訳中...")
    this.toggleSpinner(true)
    this.resultTarget.textContent = ""

    try {
      const response = await fetch("/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": this.csrfToken
        },
        body: JSON.stringify({ text })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "翻訳に失敗しちゃった")
      }

      this.resultTarget.textContent = data.translated_text
      this.setBadge(data.source_lang, data.target_lang)
      this.setStatus("翻訳完了")
    } catch (error) {
      console.error("Translation failed:", error)
      this.showError(error.message || "通信に失敗しちゃった")
      this.setStatus("エラー")
    } finally {
      this.toggleSpinner(false)
    }
  }

  setBadge(source, target) {
    if (!this.hasBadgeTarget) return
    const from = source || "?"
    const to = target || "?"
    this.badgeTarget.textContent = `${from} → ${to}`
  }

  setStatus(text) {
    if (this.hasStatusTarget) this.statusTarget.textContent = text
  }

  toggleSpinner(show) {
    if (!this.hasSpinnerTarget) return
    this.spinnerTarget.classList.toggle("hidden", !show)
  }

  showError(message) {
    if (!this.hasErrorTarget) return
    if (message) {
      this.errorTarget.textContent = message
      this.errorTarget.classList.remove("hidden")
    } else {
      this.errorTarget.textContent = ""
      this.errorTarget.classList.add("hidden")
    }
  }

  get csrfToken() {
    return document.querySelector("meta[name='csrf-token']")?.content
  }
}

