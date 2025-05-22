// Financial Management Module
const FinancialManager = {
  // Static financial data
  staticData: {
    transactions: [
      {
        id: 1,
        date: "2024-03-15",
        description: "Rent Payment",
        category: "rent",
        type: "expense",
        amount: 1200.0,
      },
      {
        id: 2,
        date: "2024-03-14",
        description: "Salary",
        category: "income",
        type: "income",
        amount: 3000.0,
      },
      {
        id: 3,
        date: "2024-03-13",
        description: "Electricity Bill",
        category: "utilities",
        type: "expense",
        amount: 85.5,
      },
      {
        id: 4,
        date: "2024-03-12",
        description: "Groceries",
        category: "groceries",
        type: "expense",
        amount: 150.75,
      },
      {
        id: 5,
        date: "2024-03-11",
        description: "Freelance Work",
        category: "income",
        type: "income",
        amount: 500.0,
      },
    ],
    summary: {
      balance: 2063.75,
      income: 3500.0,
      expenses: 1436.25,
    },
  },
  async getTransactions() {
    try {
      const response = await fetch(`http://localhost:5000/api/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Couldn't get transactions");
      }
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  },

  // Initialize the financial page
  init() {
    this.displayTransactions();
    this.setupEventListeners();
  },

  // Display transactions in the table
  async displayTransactions() {
    const transactions = await this.getTransactions();
    const transactionsList = document.getElementById("transactions-list");
    transactionsList.innerHTML = transactions
      .map(
        (transaction) => `
        <tr>
          <td>${new Date(transaction.date).toLocaleDateString()}</td>
          <td>${transaction.description}</td>
          <td>${transaction.category}</td>
          <td class="${transaction.type}">$${transaction.amount.toFixed(2)}</td>
          <td>
            <button data-id="${
              transaction._id
            }" id="remove-transaction" class="remove-button">X</button>
          </td>
        </tr>
      `
      )
      .join("");
  },

  // Set up event listeners
  setupEventListeners() {
    // Transaction form submission
    // const transactionForm = document.getElementById("transaction-form");
    // transactionForm.addEventListener("submit", (e) => {
    //   e.preventDefault();
    //   this.showMessage(
    //     "This is a demo version. Adding transactions is disabled."
    //   );
    // });

    // Edit and delete buttons
    document
      .getElementById("transactions-list")
      .addEventListener("click", (e) => {
        const button = e.target.closest("button");
        if (!button) return;

        if (
          button.classList.contains("edit") ||
          button.classList.contains("delete")
        ) {
          this.showMessage(
            "This is a demo version. Editing and deleting transactions is disabled."
          );
        }
      });

    document
      .getElementById("showTransactionForm")
      .addEventListener("click", () => {
        // document.getElementById("add-transaction").classList.toggle("show");
        // document.getElementById("transactionForm").classList.toggle("show");
        openModal("addTransactionModal");
      });
  },

  // Show message to user
  showMessage(message) {
    alert(message);
  },
};

// Notification Bell Functionality
document.addEventListener("DOMContentLoaded", function () {
  const notificationBell = document.getElementById("notificationBell");
  const notificationDropdown = document.getElementById("notificationDropdown");
  const markAllReadButton = document.querySelector(".mark-all-read");

  // Toggle notification dropdown
  notificationBell.addEventListener("click", function (e) {
    e.stopPropagation();
    notificationDropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (
      !notificationBell.contains(e.target) &&
      !notificationDropdown.contains(e.target)
    ) {
      notificationDropdown.classList.remove("show");
    }
  });

  // Mark all notifications as read
  markAllReadButton.addEventListener("click", function () {
    const unreadNotifications = document.querySelectorAll(
      ".notification-item.unread"
    );
    unreadNotifications.forEach((notification) => {
      notification.classList.remove("unread");
    });
    // Update badge count
    const badge = document.querySelector(".notification-badge");
    badge.textContent = "0";
    badge.style.display = "none";
  });
});

// Initialize the financial page when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  FinancialManager.init();
});
