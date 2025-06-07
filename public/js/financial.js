// Financial Management Module
const renderTransactions = async (transactions) => {
  const transactionsList = document.getElementById("transactions-list");
  transactionsList.innerHTML = ""; // Clear previous content

  if (!transactionsList) return;

  const table = document.querySelector(".members-table");

  table.innerHTML = `
    ${
      transactions?.length
        ? `<thead>
        <tr>
          <th>Date</th>
          <th>Title</th>
          <th>Category</th>
          <th>Amount</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="transactions-list">`
        : `<tbody id="transactions-list"><tr><td style="text-align:center;">No transactions available.</td></tr></tbody>`
    }

        ${transactions
          .map(
            (transaction) => `
                    <tr>
                      <td>${formatDate(transaction.date_uploaded)}</td>
                      <td>${transaction.title}</td>
                      <td>${transaction.category}</td>
                      <td class="${
                        transaction.type
                      }">$${transaction.amount.toFixed(2)}</td>
                      <td>
                        <button class="remove-button" data-id="${
                          transaction._id
                        }">X</button>
                      </td>
                    </tr>
                  `
          )
          .join("")}
      </tbody>
    `;

  document.querySelectorAll(".remove-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      showConfirmationModal({
        message: "Are you sure you want to remove this transaction?",
        onConfirm: () => removeTransaction(e),
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
    console.log(transactions)
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

  // Send transaction data with selected roommates
  addTransaction(title, parseFloat(amount), category, dueDate, split_between);

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
