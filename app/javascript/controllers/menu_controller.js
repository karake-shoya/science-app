import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    console.log("Menu controller connected!");

    this.userMenuButton = this.element.querySelector("#user-menu-button");
    this.userMenu = this.element.querySelector('[role="menu"]');

    if (this.userMenuButton) {
      this.userMenuButton.addEventListener("click", this.toggleMenu.bind(this));
    }

    document.addEventListener("click", this.closeMenu.bind(this));
  }

  toggleMenu(event) {
    event.stopPropagation();
    const isExpanded = this.userMenuButton.getAttribute("aria-expanded") === "true";
    this.userMenuButton.setAttribute("aria-expanded", !isExpanded);
    this.userMenu.classList.toggle("hidden");
  }

  closeMenu(event) {
    if (
      this.userMenuButton &&
      !this.userMenuButton.contains(event.target) &&
      this.userMenu &&
      !this.userMenu.contains(event.target)
    ) {
      this.userMenuButton.setAttribute("aria-expanded", "false");
      this.userMenu.classList.add("hidden");
    }
  }
}
