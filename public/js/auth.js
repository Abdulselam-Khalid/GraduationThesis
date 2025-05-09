const Auth = {
  isLoggedIn() {
    return !!this.getToken();
  },

  getToken() {
    return sessionStorage.getItem("token");
  },

  setToken(token) {
    sessionStorage.setItem("token", token);
  },

  setUserData(user) {
    sessionStorage.setItem("userData", JSON.stringify(user));
  },

  getUserData() {
    const userData = sessionStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  },

  logout() {
    sessionStorage.clear();
    window.location.href = "/login.html";
  },

  clearStorageIfExpired() {
    const EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes
    const now = Date.now();
    const lastClearTime = sessionStorage.getItem("lastClearTime");

    if (!lastClearTime || now - Number(lastClearTime) > EXPIRY_TIME) {
      sessionStorage.clear();
      sessionStorage.setItem("lastClearTime", now);
    }
  },

  redirectIfLoggedIn() {
    if (this.isLoggedIn()) {
      window.location.href = "/dashboard.html";
    }
  },
};

// Login page handler
function initLogin() {
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Login failed");

        Auth.setToken(data.token);
        Auth.setUserData(data.user);
        sessionStorage.setItem("lastClearTime", Date.now());

        window.location.href = "/dashboard.html";
      } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = "block";
      }
    });
  }
}

// Global auth guard for protected pages
function checkAuth() {
  Auth.clearStorageIfExpired();

  const path = window.location.pathname;
  const isAuthPage = ["/login.html", "/register.html"].includes(path);

  if (!Auth.isLoggedIn() && !isAuthPage) {
    window.location.href = "/login.html";
  } else if (Auth.isLoggedIn() && isAuthPage) {
    window.location.href = "/dashboard.html";
  }

  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", Auth.logout);
  }
}

document.addEventListener("DOMContentLoaded", checkAuth);
