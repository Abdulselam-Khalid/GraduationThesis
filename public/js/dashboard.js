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

const renderTasks = async (tasks) => {
  const list = document.getElementById("tasks-list");
  list.innerHTML = tasks?.length 
    ? tasks.slice(0, 4).map(task => `
        <li>
          <span>
            <input type="checkbox" disabled ${task.completed ? "checked" : ""} />
            <strong>${task.title}</strong><br />
            <small>${task.description || ""}</small>
          </span>
          <span style="font-size:0.95em;color:#3d5af1;">
            ${task.status === "In Progress" ? "In Progress" : task.priority || ""}
            ${task.due ? `<span style='color:#dc3545;margin-left:8px;'>Due: ${task.due}</span>` : ""}
          </span>
        </li>
      `).join("")
    : "<strong>No tasks available.</strong>";
};
const renderDeadlines = (tasks) => {
  if (!tasks || !Array.isArray(tasks)) return;
  console.log(tasks);
  const tbody = document.getElementById("deadlines-list");
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Normalize time

  // Filter upcoming, incomplete tasks, then sort and limit to 3
  const upcomingTasks = tasks
    .filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return !task.completed && taskDate >= currentDate;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  tbody.innerHTML = upcomingTasks.length
    ? upcomingTasks.map(task => `<tr><td>${task.title}</td><td style="text-align:right;">${formatDate(task.dueDate)}</td></tr>`).join("")
    : `<tr><td style="text-align:center;">No upcoming deadlines</td></tr>`;
};
const renderActivities = () => {
  const list = document.getElementById("activity-list");
  list.innerHTML = "";
  activities.forEach((act) => {
    const li = document.createElement("li");
    li.textContent = act.text;
    list.appendChild(li);
  });
};
const renderExpenses = () => {
  const list = document.getElementById("expenses-list");
  list.innerHTML = "";
  expenses.forEach((exp) => {
    const li = document.createElement("li");
    li.textContent = exp.text;
    list.appendChild(li);
  });
};
const renderNotifications = () => {
  const list = document.getElementById("notifications-list");
  list.innerHTML = "";
  notifications.forEach((note) => {
    const li = document.createElement("li");
    li.textContent = note.text;
    list.appendChild(li);
  });
};
const fetchAndRender = async () => {
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
    renderTasks(tasks);
    renderDeadlines(tasks);
  } catch (error) {
    console.error({ error: error.message });
  }
  renderActivities();
  renderExpenses();
  renderNotifications();
};
document.addEventListener("DOMContentLoaded", async () => {
  fetchAndRender();
});
