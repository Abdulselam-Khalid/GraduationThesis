// Financial Management Module
const renderTransactions = async (transactions) => {
  const transactionsList = document.getElementById("transactions-list");
  transactionsList.innerHTML = ""; // Clear previous content

  const currentUser = groupData.members.find((m) => m._id === userData.id);
  const isAdmin = currentUser?.role === "admin";
  if (!transactionsList) return;

  const table = document.querySelector(".members-table");

  table.innerHTML = `
  ${
    transactions?.length
      ? `
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Due</th>
            <th>Due Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="transactions-list">
          ${transactions
            .map((transaction) => {
              const userShare = transaction.split_between.find(
                (m) => m.roommate_id === userData.id
              );

              let actionCell = "";

              if (userShare?.status === "pending") {
                actionCell += `<button class="pay-button" data-id="${userShare._id}">Pay</button> `;
              }
              if (userShare?.status === "paid") {
                actionCell += "Paid ";
              }
              if (isAdmin) {
                actionCell += `<button class="remove-button" data-id="${transaction._id}">X</button> `;
              }

              return `
                <tr>
                  <td>${formatDate(transaction.date_uploaded)}</td>
                  <td>${transaction.title}</td>
                  <td>${transaction.category}</td>
                  <td class="${transaction.type}">$${transaction.amount.toFixed(
                2
              )}</td>
                  <td>$${transaction.amount_owed.toFixed(2)}</td>
                  <td>${formatDate(transaction.dueDate)}</td>
                  <td>${actionCell}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      `
      : `
        <tbody id="transactions-list">
          <tr><td colspan="7" style="text-align:center;">No transactions available.</td></tr>
        </tbody>
      `
  }
`;

  if (isAdmin) {
    try {
      const response = await fetch("http://localhost:5000/api/expenses/admin", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const expenses = await response.json();
      const section = document.getElementById("history-section");
      section.classList = "card transaction-history";
      section.innerHTML = `
      <h2>Transactions History</h2>
      <div class="table-container">
        <table class="members-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Paid By</th>
            </tr>
          </thead>
          <tbody>
            ${expenses
              .sort(
                (a, b) => new Date(b.date_uploaded) - new Date(a.date_uploaded)
              ) // Sort by latest first
              .slice(0, 5) // Take only the top 5
              .map(
                (expense) => `
                  <tr>
                    <td>${formatDate(expense.date_uploaded)}</td>
                    <td>${expense.title}</td>
                    <td>${expense.amount.toFixed(2)}</td>
                    <td>${expense.split_between
                      .filter((s) => s.status === "paid")
                      .map((s) => s.roommate_id.name)
                      .join(", ")}</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
    } catch (error) {
      console.error(error);
    }
  }
  document.querySelectorAll(".remove-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      showConfirmationModal({
        message: "Are you sure you want to remove this transaction?",
        onConfirm: () => removeTransaction(e),
      });
    });
  });
  document.querySelectorAll(".pay-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      showConfirmationModal({
        message: "Please confirm that you have paid the amount owed",
        onConfirm: () => payAmount(e),
      });
    });
  });
};

const fetchAndRender = async () => {
  if (!token) return (window.location.href = "/login.html");

  try {
    const response = await fetch(`http://localhost:5000/api/expenses`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch transactions");

    const transactions = await response.json();
    await renderTransactions(transactions);
  } catch (error) {
    console.error("Error loading transactions:", error);
    document.getElementById("transactions-list").innerHTML =
      "<p>Error loading transactions. Please try again later.</p>";
  }
};

const addTransaction = async (
  title,
  amount,
  amount_owed,
  category,
  dueDate,
  split_between
) => {
  if (!token) return alert("You must be logged in to add a transaction.");

  if (
    dueDate &&
    new Date(dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
  ) {
    return alert("Due date cannot be in the past.");
  }

  // Format split_between array according to the model schema
  const formattedSplitBetween = split_between.map((roommateId) => ({
    roommate_id: roommateId,
  }));

  const data = {
    title,
    amount,
    amount_owed,
    category,
    ...(dueDate && { dueDate }),
    split_between: formattedSplitBetween,
  };

  try {
    const response = await fetch("http://localhost:5000/api/expenses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add transaction");
    }

    alert("Transaction added successfully");
    fetchAndRender();
  } catch (error) {
    console.error("Error adding transaction:", error);
    alert("Failed to add transaction.");
  }
};

const removeTransaction = async (e) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/expenses/${e.target.dataset.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to delete transaction");

    closeModal("confirmModal");
    fetchAndRender();
  } catch (error) {
    console.error(error);
    alert("Could not remove transaction.");
  }
};

const submitNewTransaction = () => {
  const title = document.getElementById("transaction-title").value.trim();
  const amount = document.getElementById("transaction-amount").value.trim();
  const category = document.getElementById("transaction-category").value;
  const dueDate = document.getElementById("transaction-dueDate").value;

  // Retrieve all selected roommates
  const selectedRoommates = Array.from(
    document.querySelectorAll(
      "#roommate-checkbox-container input.roommate-checkbox:checked"
    )
  ).map((cb) => cb.value);

  // If "All Roommates" is selected, get all roommate IDs
  const selectAllChecked = document.getElementById("select-all").checked;
  const split_between = selectAllChecked
    ? Array.from(
        document.querySelectorAll(
          "#roommate-checkbox-container input.roommate-checkbox"
        )
      ).map((cb) => cb.value)
    : selectedRoommates;

  if (![title, amount, category].every(Boolean)) {
    return alert("Please fill in all fields.");
  }

  if (split_between.length === 0) {
    return alert("Please select at least one roommate to split with.");
  }
  const amount_owed = parseFloat(amount / split_between.length);
  // Send transaction data with selected roommates
  addTransaction(
    title,
    parseFloat(amount),
    amount_owed,
    category,
    dueDate,
    split_between
  );

  // Reset modal inputs
  [
    "transaction-title",
    "transaction-amount",
    "transaction-category",
    "transaction-dueDate",
  ].forEach((id) => (document.getElementById(id).value = ""));

  document
    .querySelectorAll("#roommate-checkbox-container input.roommate-checkbox")
    .forEach((cb) => (cb.checked = false));
  document.getElementById("select-all").checked = false;

  closeModal("addTransactionModal");
};
const payAmount = async (e) => {
  const transaction_id = e.target.dataset.id;
  try {
    const response = await fetch("http://localhost:5000/api/expenses", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transaction_id }),
    });
    if (!response.ok) throw new Error("Failed to process payment");
    closeModal("confirmModal");
    alert("Payment successful");
    fetchAndRender();
  } catch (error) {
    console.error(error);
    closeModal("confirmModal");
    alert("There was an error. Payment unsuccessful");
  }
};

// Setup event listeners
const setupEventListeners = () => {
  // Add transaction button
  const showTransactionForm = document.getElementById("showTransactionForm");
  if (showTransactionForm) {
    showTransactionForm.addEventListener("click", () => {
      openModal("addTransactionModal");
    });
  }
};
const fetchRoommates = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/groups", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch roommates");

    return await response.json();
  } catch (error) {
    console.error("Error loading roommates:", error);
    return [];
  }
};
const populateRoommateCheckboxes = async () => {
  const data = await fetchRoommates();
  const roommates = data.members;
  const container = document.getElementById("roommate-checkbox-container");

  if (!container || !roommates.length) return;

  container.innerHTML = roommates
    .map(
      (roommate) => `
        <label class="label-splitBetween primaryInput">
          <input type="checkbox" class="roommate-checkbox" value="${roommate._id}"> ${roommate.name}
        </label>
      `
    )
    .join("");

  // Checkbox handling
  const selectAllCheckbox = document.getElementById("select-all");
  const roommateCheckboxes = document.querySelectorAll(".roommate-checkbox");

  if (selectAllCheckbox && roommateCheckboxes.length) {
    selectAllCheckbox.addEventListener("change", () => {
      if (selectAllCheckbox.checked) {
        roommateCheckboxes.forEach((cb) => (cb.checked = false));
      }
    });

    roommateCheckboxes.forEach((cb) => {
      cb.addEventListener("change", () => {
        if (cb.checked) {
          selectAllCheckbox.checked = false;
        }

        const allChecked = [...roommateCheckboxes].every((cb) => cb.checked);
        if (allChecked) {
          selectAllCheckbox.checked = true;
          roommateCheckboxes.forEach((cb) => (cb.checked = false));
        }
      });
    });
  }
};

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  await fetchAndRender();
  populateRoommateCheckboxes();
  setupEventListeners();
});
