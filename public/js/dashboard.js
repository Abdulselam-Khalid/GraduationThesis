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
    ? tasks
        .slice(0, 4)
        .map(
          (task) => `
        <li>
          <span>
            <input type="checkbox" disabled ${
              task.completed ? "checked" : ""
            } />
            <strong>${task.title}</strong><br />
            <small>${task.description || ""}</small>
          </span>
          <span style="font-size:0.95em;color:#3d5af1;">
            ${
              task.status === "In Progress"
                ? "In Progress"
                : task.priority || ""
            }
            ${
              task.due
                ? `<span style='color:#dc3545;margin-left:8px;'>Due: ${task.due}</span>`
                : ""
            }
          </span>
        </li>
      `
        )
        .join("")
    : "<p>No tasks available.</p>";
};
const renderDeadlines = (tasks) => {
  if (!tasks || !Array.isArray(tasks)) return;
  const tbody = document.getElementById("deadlines-list");
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Normalize time

  // Filter upcoming, incomplete tasks, then sort and limit to 3
  const upcomingTasks = tasks
    .filter((task) => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return !task.completed && taskDate >= currentDate;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  tbody.innerHTML = upcomingTasks.length
    ? upcomingTasks
        .map(
          (task) =>
            `<tr><td>${
              task.title
            }</td><td style="text-align:right;">${formatDate(
              task.dueDate
            )}</td></tr>`
        )
        .join("")
    : `<tr><td style="text-align:center;">No upcoming deadlines</td></tr>`;
};
const renderActivities = async () => {
  const list = document.getElementById("activity-list");

  try {
    const response = await fetch(
      `http://localhost:5000/api/notifications/group/${groupData._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    let activities = await response.json();
    activities = activities.slice(0, 3);

    list.innerHTML = activities.length
      ? activities.map((act) => `<li>${act.message}</li>`).join("")
      : `<p style="text-align:center;">No new activities</p>`;
  } catch (error) {
    list.innerHTML = `<p style="text-align:center;">No new activities</p>`;
  }
};

const fetchZenQuote = async () => {
  try {
    const response = await fetch("http://api.quotable.io/random?tags=inspirational");
    const data = await response.json();

    document.getElementById("zen-quote").textContent = `"${data.content}"`;
    document.getElementById("zen-author").textContent = `— ${data.author}`;
  } catch (error) {
    document.getElementById("zen-quote").textContent = "Could not load quote.";
    console.error("Error fetching quote:", error);
  }
};
// const inputImage = ()=>{
// const fileInput = document.getElementById('fileInput');

// fileInput.addEventListener('change', async (event) => {
//   const file = event.target.files[0];
//   const formData = new FormData();
//   formData.append('file', file);

//   try {
//     const response = await fetch(`http://localhost:5000/api/uploads`, {
//       method: 'POST',
//       body: formData,
//       headers:{
//         Authorization: `Bearer ${token}`
//       }
//     });

//     const data = await response.json();
//     console.log('Uploaded file info:', data);
//     fetchImage()
//   } catch (error) {
//     console.error('Error uploading file:', error);
//   }
// });
// }


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
};
document.addEventListener("DOMContentLoaded", async () => {
  fetchAndRender();
  fetchZenQuote();
});

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
