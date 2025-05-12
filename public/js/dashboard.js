const token = sessionStorage.getItem("token");
const userData = JSON.parse(sessionStorage.getItem("userData"));
const deadlines = [
  { name: "Forms Due", date: "Apr 28" },
  { name: "Trash Day", date: "May 1" },
];

const activities = [
  { text: 'Ali marked "Vacuum living room" as done' },
  { text: 'Sara added a new task: "Fix leaky faucet"' },
];

const expenses = [
  { text: "Sara paid $40 for groceries. Ali owes $20." },
  { text: "Abdulseslam paid $60 for utilities. Sara owes $30." },
];

const notifications = [
  { text: "You have 3 tasks due tomorrow" },
  { text: "Ali commented on your task" },
];

async function renderTasks() {
  const list = document.getElementById("tasks-list");
  list.innerHTML = "";
  try {
    const response = await fetch("http://localhost:5000/api/tasks", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }

    const tasks = await response.json();

    // ✅ Check if tasks array is empty or null
    if (!tasks || tasks.length === 0) {
      document.getElementById("tasks-list").innerHTML =
        "<strong>No tasks available.</strong>";
      return;
    }
    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.innerHTML = `
      <span>
        <input type="checkbox" disabled ${
          task.completed === true ? "checked" : ""
        } />
        <strong>${task.title}</strong><br />
        <small>${task.description || ""}</small>
        </span>
        <span style="font-size:0.95em;color:#3d5af1;">
        ${task.status === "In Progress" ? "In Progress" : task.priority || ""}
        ${
          task.due
            ? "<span style='color:#dc3545;margin-left:8px;'>Due: " +
              task.due +
              "</span>"
            : ""
        }
          </span>
          `;
      list.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
}

function renderDeadlines() {
  const tbody = document.getElementById("deadlines-list");
  tbody.innerHTML = "";
  deadlines.forEach((dl) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${dl.name}</td><td style="text-align:right;">${dl.date}</td>`;
    tbody.appendChild(tr);
  });
}

function renderActivities() {
  const list = document.getElementById("activity-list");
  list.innerHTML = "";
  activities.forEach((act) => {
    const li = document.createElement("li");
    li.textContent = act.text;
    list.appendChild(li);
  });
}

function renderExpenses() {
  const list = document.getElementById("expenses-list");
  list.innerHTML = "";
  expenses.forEach((exp) => {
    const li = document.createElement("li");
    li.textContent = exp.text;
    list.appendChild(li);
  });
}

function renderNotifications() {
  const list = document.getElementById("notifications-list");
  list.innerHTML = "";
  notifications.forEach((note) => {
    const li = document.createElement("li");
    li.textContent = note.text;
    list.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  renderTasks();
  renderDeadlines();
  renderActivities();
  renderExpenses();
  renderNotifications();
});
