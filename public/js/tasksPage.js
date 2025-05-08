const token = sessionStorage.getItem("token");
const userData = JSON.parse(sessionStorage.getItem("userData"));
const groupData = JSON.parse(sessionStorage.getItem("groupData"));
function renderTasks(tasks) {
  const list = document.getElementById("tasks-list");
  list.innerHTML = "";

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
        <span>
          <button data-id="${task._id}" ${
      task.completed === true
        ? 'class="finished-task-btn"'
        : 'class="completed-task-btn"'
    }>${task.completed === true ? "Completed" : "Complete"}</button>
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
            button.addEventListener("click", addTask);
          });
        }
      } catch (error) {
        console.log(error);
      }
    })();
  // ✅ Attach event listeners AFTER rendering all tasks
  document.querySelectorAll(".completed-task-btn").forEach((button) => {
    button.addEventListener("click", completeTask);
  });
  document.querySelectorAll("#remove-task").forEach((button) => {
    button.addEventListener("click", removeTask);
  });
}

async function fetchAndRenderTasks() {
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
  }
}

async function addTask() {
  const title = prompt("Enter task title:");
  if (!title) return;

  const description = prompt("Enter task description:");
  if (!description) return;

  const memberName = prompt("Enter member name:");
  if (!memberName) return;

  const member = groupData.members.find(
    (m) => m.name.toLowerCase() === memberName.toLowerCase()
  );
  
  if (!member) {
    alert("Member not found in the group.");
    return;
  }

  if (!token) {
    alert("You must be logged in to add a task.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        description: description,
        assignedTo: member._id,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to add task");
    }
    alert(`Task assigned to ${member.name} successfully`)

    fetchAndRenderTasks();
  } catch (error) {
    console.error(error);
    alert("Failed to add task. See console for details.");
  }
}

// ✅ Updated completeTask function
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

    fetchAndRenderTasks(); // Refresh task list
  } catch (error) {
    console.error("Error completing task:", error);
    alert("Could not complete the task.");
  }
};
const removeTask = async (e) => {
  const taskId = e.target.dataset.id;
  if (!confirm("Are you sure you want to remove this task?")) return;
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
    console.log(error);
    alert("Could not remove task");
  }
  fetchAndRenderTasks();
};
document.addEventListener("DOMContentLoaded", async () => {
  await fetchAndRenderTasks();
});
