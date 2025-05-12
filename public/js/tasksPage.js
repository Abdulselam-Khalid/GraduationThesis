const token = sessionStorage.getItem("token");
const userData = JSON.parse(sessionStorage.getItem("userData"));
const groupData = JSON.parse(sessionStorage.getItem("groupData"));

const renderTasks = (tasks) => {
  const list = document.getElementById("tasks-list");
  list.innerHTML = "";
  // ✅ Check if tasks array is empty or null
  if (!tasks || tasks.length === 0) {
    document.getElementById("tasks-list").innerHTML =
      "<strong>No tasks available.</strong>";
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
        <span>${
          !task.completed
            ? `<strong>${formatDate(task.dueDate) || ""}</strong>`
            : "<strong>Done  </strong>"
        }
          ${
            task.completed === false
              ? `<button data-id="${task._id}" class="completed-task-btn">Complete</button>`
              : ""
          }
    ${
      userData.id == groupData.createdBy
        ? `<button data-id="${task._id}" id="remove-task" class="remove-btn">X</button>`
        : ""
    }
        </span>
      `;

    list.appendChild(li);
  });
  if (!document.querySelector("#add-task-btn"))
    (async () => {
      try {
        const response = await fetch("http://localhost:5000/api/groups", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch groups");
        }
        const group = await response.json();
        const button = document.createElement("button");
        button.innerHTML = "Add Task";
        button.classList = "add-btn";
        button.id = "add-task-btn";
        const section = document.querySelector(".tasks-card");
        if (group.createdBy == userData.id) {
          section.appendChild(button);
          document.querySelectorAll("#add-task-btn").forEach((button) => {
            button.addEventListener("click", () => {
              openModal("addTaskModal");
            });
          });
        }
      } catch (error) {
        console.error(error);
      }
    })();
  // ✅ Attach event listeners AFTER rendering all tasks
  document.querySelectorAll(".completed-task-btn").forEach((button) => {
    button.addEventListener("click", completeTask);
  });
  document.querySelectorAll("#remove-task").forEach((button) => {
    button.addEventListener("click", (e) => {
      openModal("confirmModal");
      document.getElementById("confirmHeader").textContent = `Confirm`;
      document.getElementById(
        "confirmMessage"
      ).textContent = `Are you sure you want to remove this task?`;
      const confirmYes = document.getElementById("confirmYes");
      const confirmNo = document.getElementById("confirmNo");

      // Remove previous event listeners to prevent duplication
      confirmYes.replaceWith(confirmYes.cloneNode(true));
      confirmNo.replaceWith(confirmNo.cloneNode(true));

      document
        .getElementById("confirmYes")
        .addEventListener("click", () => removeTask(e));
      document
        .getElementById("confirmNo")
        .addEventListener("click", () => closeModal("confirmModal"));
    });
  });
};
const fetchAndRender = async () => {
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

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
  } catch (error) {
    console.error("Error loading tasks:", error);
    document.getElementById("tasks-list").innerHTML =
      "<p>Error loading tasks. Please try again later.</p>";
  }
};
const addTask = async (title, description, dueDate) => {
  if (!token) {
    alert("You must be logged in to add a task.");
    return;
  }
  let taskData = {
    title: title,
    description: description,
    assignedTo: userData.id,
    groupId: groupData._id,
  };
  console.log(taskData);

  if (dueDate) {
    taskData.dueDate = dueDate;
  }

  try {
    let response = await fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error("Failed to add task");
    }
    alert(`Task assigned successfully`);
    fetchAndRender();
  } catch (error) {
    console.error(error);
    alert("Failed to add task.");
  }
};
const completeTask = async (e) => {
  const taskId = e.target.dataset.id;

  try {
    const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: "PUT", // or "PATCH" if your API supports partial updates
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: true }),
    });

    if (!response.ok) {
      throw new Error("Failed to mark task as complete");
    }

    fetchAndRender(); // Refresh task list
  } catch (error) {
    console.error("Error completing task:", error);
    alert("Could not complete the task.");
  }
};
const removeTask = async (e) => {
  const taskId = e.target.dataset.id;
  try {
    const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
  } catch (error) {
    console.error(error);
    alert("Could not remove task");
  }
  closeModal("confirmModal");
  fetchAndRender();
};
const submitNewTask = () => {
  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  let dueDate = "";
  dueDate = document.getElementById("taskDeadline").value;

  if (!title || !description) {
    alert("Please fill in all fields.");
    return;
  }

  addTask(title, description, dueDate);

  // Reset modal inputs
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDescription").value = "";
  document.getElementById("taskDeadline").value = "";
  closeModal("addTaskModal");
};

document.addEventListener("DOMContentLoaded", async () => {
  await fetchAndRender();
});
