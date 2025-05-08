// Global application state
const App = {
  init() {
    // Check authentication status
    this.checkAuth();

    // Initialize any global event listeners
    this.initEventListeners();
  },

  checkAuth() {
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath === "/login" || currentPath === "/register";

    if (!Auth.isLoggedIn() && !isAuthPage) {
      window.location.href = "/login";
    } else if (Auth.isLoggedIn() && isAuthPage) {
      window.location.href = "/dashboard";
    }
  },

  initEventListeners() {
    // Add any global event listeners here
    document.addEventListener("click", (e) => {
      if (e.target.matches("[data-link]")) {
        e.preventDefault();
        const href = e.target.getAttribute("href");
        window.location.href = href;
      }
    });
  },
};

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
