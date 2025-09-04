"use strict";
// src/app.ts
class WeeklyChoresApp {
    constructor() {
        this.statusElement = null;
        this.init();
    }
    init() {
        // Wait for DOM to be ready
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => this.onDOMReady());
        }
        else {
            this.onDOMReady();
        }
    }
    onDOMReady() {
        this.statusElement = document.getElementById("status");
        this.updateStatus();
    }
    updateStatus() {
        if (this.statusElement) {
            const now = new Date();
            const timeString = now.toLocaleString("no-NO");
            this.statusElement.textContent = `App lastet kl. ${timeString} - Alt fungerer! `;
        }
    }
}
// Initialize the app
new WeeklyChoresApp();
//# sourceMappingURL=app.js.map