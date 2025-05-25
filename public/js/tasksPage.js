const renderTasks = async (tasks) => {
  const list = document.getElementById("tasks-list");
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Normalize time

  list.innerHTML = tasks?.length
    ? tasks
        .map((task) => {
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          const isPastDeadline = taskDate < currentDate;
          const deadlineStyle = isPastDeadline ? "color: red;" : "";

          return `
        <li>
          <span>
            <input type="checkbox" disabled ${
              task.completed ? "checked" : ""
            } />
            <strong>${task.title}</strong><br />
            <small>${task.description || ""}</small>
          </span>
          <span>
            ${
              task.completed
                ? "<strong>Done</strong>"
                : `<strong style="${deadlineStyle}">${
                    formatDate(task.dueDate) || ""
                  }</strong>`
            }
            ${
              !task.completed
                ? `<button data-id="${task._id}" class="complete-button">Complete</button>`
                : ""
            }
            ${
              userData.id === groupData.createdBy
                ? `<button data-id="${task._id}" class="remove-button">X</button>`
                : ""
            }
          </span>
        </li>`;
        })
        .join("")
    : "<strong>No tasks available.</strong>";

  // Add "Add Task" button if user is group creator
  if (!document.querySelector("#add-task-button")) {
    try {
      const response = await fetch("http://localhost:5000/api/groups", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch group");

      const group = await response.json();
      if (group.createdBy === userData.id) {
        const button = document.createElement("button");
        button.id = "add-task-button";
        button.className = "add-button";
        button.textContent = "Add Task";
        button.onclick = () => openModal("addTaskModal");
        document.querySelector(".tasks-card").appendChild(button);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Confirm before completing a task
  document.querySelectorAll(".complete-button").forEach((button) =>
    button.addEventListener("click", (e) => {
      openModal("confirmModal");
      document.getElementById("confirmHeader").textContent = "Mark Complete";
      document.getElementById("confirmMessage").textContent =
        "Are you sure you want to mark this task as complete?";

      const yesButton = document.getElementById("confirmYes");
      const noButton = document.getElementById("confirmNo");

      yesButton.replaceWith(yesButton.cloneNode(true));
      noButton.replaceWith(noButton.cloneNode(true));

      document
        .getElementById("confirmYes")
        .addEventListener("click", () => completeTask(e));
      document
        .getElementById("confirmNo")
        .addEventListener("click", () => closeModal("confirmModal"));
    })
  );

  // Confirm before removing a task
  document.querySelectorAll(".remove-button").forEach((button) =>
    button.addEventListener("click", (e) => {
      openModal("confirmModal");
      document.getElementById("confirmHeader").textContent = "Confirm";
      document.getElementById("confirmMessage").textContent =
        "Are you sure you want to remove this task?";

      const yesButton = document.getElementById("confirmYes");
      const noButton = document.getElementById("confirmNo");

      yesButton.replaceWith(yesButton.cloneNode(true));
      noButton.replaceWith(noButton.cloneNode(true));

      document
        .getElementById("confirmYes")
        .addEventListener("click", () => removeTask(e));
      document
        .getElementById("confirmNo")
        .addEventListener("click", () => closeModal("confirmModal"));
    })
  );
};

const fetchAndRender = async () => {
  if (!token) return (window.location.href = "/login.html");

  try {
    const res = await fetch("http://localhost:5000/api/tasks", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const tasks = await res.json();
    if (!res.ok) throw new Error(tasks.message || "Failed to fetch tasks");

    renderTasks(tasks);
  } catch (err) {
    console.error("Error loading tasks:", err);
    document.getElementById("tasks-list").innerHTML =
      "<p>Error loading tasks. Please try again later.</p>";
  }
};
const addTask = async (title, description, dueDate) => {
  if (!token) return alert("You must be logged in to add a task.");
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  if (dueDate) {
    const taskDate = new Date(dueDate);
    taskDate.setHours(0, 0, 0, 0);

    // Check if the due date is in the past
    if (taskDate < currentDate) {
      alert("Due date cannot be in the past.");
      return;
    }
  }
  const taskData = {
    title,
    description,
    assignedTo: userData.id,
    groupId: groupData._id,
    ...(dueDate && { dueDate }),
  };

  try {
    const res = await fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!res.ok) throw new Error("Failed to add task");

    alert("Task assigned successfully");
    fetchAndRender();
  } catch (err) {
    console.error(err);
    alert("Failed to add task.");
  }
};
const completeTask = async (e) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/tasks/${e.target.dataset.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: true }),
      }
    );
    if (!response.ok) throw new Error("Failed to mark task as complete");
    closeModal("confirmModal");
    fetchAndRender();
  } catch (error) {
    console.error("Error completing task:", error);
    alert("Could not complete the task.");
  }
};
const removeTask = async (e) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/tasks/${e.target.dataset.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to delete task");

    closeModal("confirmModal");
    fetchAndRender();
  } catch (error) {
    console.error(error);
    alert("Could not remove task");
  }
};
const submitNewTask = () => {
  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const dueDate = document.getElementById("taskDeadline").value;

  if (!title || !description) return alert("Please fill in all fields.");

  addTask(title, description, dueDate);

  // Reset modal inputs
  ["taskTitle", "taskDescription", "taskDeadline"].forEach(
    (id) => (document.getElementById(id).value = "")
  );

  closeModal("addTaskModal");
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

document.addEventListener("DOMContentLoaded", async () => {
  await fetchAndRender();
});
