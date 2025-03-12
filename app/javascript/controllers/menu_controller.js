import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["userMenuButton", "userMenu"];

  connect() {
    console.log("Menu controller connected!");

    if (this.hasUserMenuButtonTarget) {
      this.userMenuButtonTarget.addEventListener("click", this.toggleMenu.bind(this));
    }

    document.addEventListener("click", this.closeMenu.bind(this));
  }

  toggleMenu(event) {
    event.stopPropagation();
    const isExpanded = this.userMenuButtonTarget.getAttribute("aria-expanded") === "true";
    this.userMenuButtonTarget.setAttribute("aria-expanded", !isExpanded);
    this.userMenuTarget.classList.toggle("hidden");
  }

  closeMenu(event) {
    event.stopPropagation();
    if (
      this.hasUserMenuButtonTarget &&
      !this.userMenuButtonTarget.contains(event.target) &&
      this.hasUserMenuTarget &&
      !this.userMenuTarget.contains(event.target)
    ) {
      this.userMenuButtonTarget.setAttribute("aria-expanded", "false");
      this.userMenuTarget.classList.add("hidden");
    }
  }
}