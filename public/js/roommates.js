const renderMembers = async (group) => {
  document.getElementById("create-button")?.remove();
  const list = document.getElementById("names-list");
  list.innerHTML = "";

  const currentUser = group.members.find((m) => m._id === userData.id);
  const isAdmin = currentUser?.role === "admin";

  const table = document.createElement("table");
  table.classList.add("members-table");

  table.innerHTML = `
    <tr>
      <th>Names</th>
      <th>Email</th>
      <th>Role</th>
      ${isAdmin ? "<th>Action</th>" : ""}
    </tr>
    ${group.members
      .map((member) => {
        const canRemove = isAdmin && member.role !== "admin";
        return `
          <tr>
            <td>${member.name}</td>
            <td>${member.email}</td>
            <td>${member.role}</td>
            ${
              isAdmin
                ? `<td>${
                    canRemove

                      ? `<button id="remove-member" class="remove-button" data-group-id="${group._id}" data-id="${member._id}">X</button>`

                      : "—"
                  }</td>`
                : ""
            }
          </tr>
        `;
      })
      .join("")}
  `;

  list.appendChild(table);

  const addButton = (id, text, className, callback) => {
    if (!document.querySelector(`#${id}`)) {
      const button = document.createElement("button");
      button.innerHTML = text;
      button.classList.add(className);
      button.id = id;
      document.querySelector(".names-card").appendChild(button);
      button.addEventListener("click", callback);
    }
  };

  if (isAdmin) {

    addButton("add-roommate-button", "Add Roommate", "add-button", () =>

      openModal("addRoommateModal")
    );
  }

  addButton("leave-group-button", "Leave Group", "leave-button", () => {
    showConfirmationModal({
      message: `Are you sure you want to leave "${group.name}"?`,
      onConfirm: () => leaveGroup(group),
      confirmText: "Leave",
      cancelText: "Stay",
    });
  });

  document.querySelectorAll("#remove-member").forEach((button) => {
    button.addEventListener("click", (e) => {
      showConfirmationModal({
        message: "Are you sure you want to remove this member?",
        onConfirm: () => removeMember(e),
      });
    });
  });
};

const renderTasks = (tasks, group) => {
  const list = document.getElementById("tasks-list");
  list.innerHTML = "";

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const currentUser = group.members.find((m) => m._id === userData.id);
  const isAdmin = currentUser?.role === "admin";

  tasks.forEach((task) => {
    const li = document.createElement("li");

    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    const isPastDeadline = taskDate < currentDate;
    const deadlineStyle = isPastDeadline ? "color: red;" : "";

    const showCompleteButton =
      task.assignedTo._id === userData.id && !task.completed;
    const showRemoveButton = isAdmin;


    li.innerHTML = `
      <span>
        <input type="checkbox" disabled ${task.completed ? "checked" : ""} />
        <strong>${task.title}</strong><br />
        <p>${task.description || ""}</p>
        <p>Assigned to: <b>${task.assignedTo.name || ""}</b></p>
      </span>
      <span>
        ${
          task.completed
            ? "<strong>Done</strong>"
            : `<strong style="${deadlineStyle}">${formatDate(task.dueDate)}</strong>`
        }
        ${
          showCompleteButton
            ? `<button data-id="${task._id}" class="complete-button">Complete</button>`
            : ""
        }
        ${
          showRemoveButton
            ? `<button data-id="${task._id}" id="remove-task" class="remove-button">X</button>`
            : ""
        }
      </span>
    `;

    list.appendChild(li);
  });

  // Add Task button for admins only

  if (!document.querySelector("#add-task-button") && isAdmin) {
    const button = document.createElement("button");
    button.textContent = "Add Task";
    button.className = "add-button";
    button.id = "add-task-button";
    document.querySelector(".tasks-card").appendChild(button);

    button.addEventListener("click", () => {
      openModal("addTaskModal");

      const group = JSON.parse(sessionStorage.getItem("groupData"));
      const select = document.getElementById("options");
      select.innerHTML = "";

      const defaultOption = document.createElement("option");
      defaultOption.textContent = "Select a member";
      defaultOption.value = "";
      select.appendChild(defaultOption);

      group.members.forEach((member) => {
        const opt = document.createElement("option");
        opt.value = member._id;
        opt.textContent = member.name;
        select.appendChild(opt);
      });
    });
  }

  // Event listeners
  document
    .querySelectorAll(".complete-button")
    .forEach((button) => button.addEventListener("click", completeTask));

  document.querySelectorAll("#remove-task").forEach((button) =>
    button.addEventListener("click", (e) => {
      showConfirmationModal({
        message: "Are you sure you want to remove this task?",
        onConfirm: () => removeTask(e),
      });
    })
  );
};

const fetchAndRender = async () => {
  if (!token) return (window.location.href = "/login.html");

  try {
    // Fetch group details
    const groupRes = await fetch("http://localhost:5000/api/groups", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    let group = null;

    if (groupRes.status === 404) {
      // User has no group yet
      group = null;
    } else if (!groupRes.ok) {
      // Other server errors
      const errorText = await groupRes.text();
      throw new Error(`Failed to fetch group: ${errorText}`);
    } else {
      group = await groupRes.json();
    }

    const namesList = document.getElementById("names-list");
    const tasksList = document.getElementById("tasks-list");
    const namesCard = document.querySelector(".names-card");

    // Handle case where no group exists
    if (!group?._id) {
      namesList.innerHTML =
        "<p>No group found. Please join or create a group.</p>";
      tasksList.innerHTML = "<p>No tasks to show.</p>";


      const createButton = document.createElement("button");
      createButton.className = "add-button";
      createButton.id = "create-button";
      createButton.textContent = "Create Group";
      namesCard.appendChild(createButton);
      createButton.addEventListener("click", () =>

        openModal("createGroupModal")
      );

      return;
    }

    // Save group info
    sessionStorage.setItem("groupData", JSON.stringify(group));

    // Render members
    renderMembers(group);

    // Fetch tasks for the group
    const tasksRes = await fetch(
      `http://localhost:5000/api/groups/${group._id}/tasks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!tasksRes.ok) throw new Error("Failed to fetch tasks");

    const tasks = await tasksRes.json();
    removeOldTasks(tasks);
    renderTasks(tasks, group);
  } catch (error) {
    console.error("Error loading tasks or members:", error);
    document.getElementById("tasks-list").innerHTML =
      "<p>Error loading tasks.</p>";
    document.getElementById("names-list").innerHTML =
      "<p>Error loading members.</p>";
  }
};

const addTask = async (title, description, memberId, dueDate, groups) => {
  if (!token) return alert("You must be logged in to add a task.");

  // Validate due date if provided
  if (
    dueDate &&
    new Date(dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
  ) {
    return alert("Due date cannot be in the past.");
  }

  const taskData = {
    title,
    description,
    assignedTo: memberId,
    groupId: groups._id,
    ...(dueDate && { dueDate }), // Include dueDate only if it's valid
  };

  try {
    const response = await fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) throw new Error("Failed to add task");

    alert("Task assigned successfully");
    fetchAndRender();
  } catch (error) {
    console.error(error);
    alert("Failed to add task.");
  }
};
const completeTask = async (e) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/tasks/${e.target.dataset.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: true }),
      }
    );

    if (!response.ok) throw new Error("Failed to mark task as complete");

    fetchAndRender(); // Refresh task list
  } catch (error) {
    console.error("Error completing task:", error);
    alert("Could not complete the task.");
  }
};
const removeTask = async (e, task) => {
  try {
    // If called from event, get id from event, else from task object
    const taskId = e?.target?.dataset?.id ?? task?._id;
    if (!taskId) throw new Error("Task ID not found");

    const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to delete task");

    // Only close modal if called from event
    if (e?.target) closeModal("confirmModal");

    fetchAndRender();
  } catch (error) {
    console.error(error);
    alert("Could not remove task.");
  }
};

const leaveGroup = async (groups) => {
  if (groups.createdBy === userData.id) {
    showConfirmationModal({
      message:
        "As an admin, leaving the group will terminate it. Are you sure you want to proceed?",
      confirmText: "Leave",
      cancelText: "Stay",
      onConfirm: () => deleteGroup(groups),
    });
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/groups/${groups._id}/members/${userData.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok)
      throw new Error("Failed to remove member and delete tasks");

    alert(`You have left "${groups.name}" and your tasks have been deleted.`);

    // Remove buttons safely
    document.getElementById("leave-group-button")?.remove();
    document.getElementById("add-roommate-button")?.remove();

    closeModal("confirmModal");
    await fetchAndRender(); // Refresh UI
  } catch (error) {
    console.error("Error removing member and deleting tasks:", error);
    alert("Failed to leave the group.");
  }
};
const deleteGroup = async (groups) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/groups/${groups._id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to delete group");

    alert(`You have left "${groups.name}" and the group has been deleted.`);

    // Remove buttons efficiently
    ["leave-group-button", "add-roommate-button", "add-task-button"].forEach(
      (id) => document.getElementById(id)?.remove()
    );

    closeModal("confirmModal");
    fetchAndRender();
  } catch (error) {
    console.error("Error deleting group:", error);
  }
};
const removeMember = async (e) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/groups/${e.target.dataset.groupId}/members/${e.target.dataset.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to remove member");
    closeModal("confirmModal");
    await fetchAndRender(); // Refresh UI
  } catch (error) {
    console.error("Error removing member:", error);
    alert("Could not remove the member.");
  }
};
const addMember = async (email) => {
  if (!email) return alert("Please provide an email.");

  try {
    const groupRes = await fetch("http://localhost:5000/api/groups", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!groupRes.ok) throw new Error("Failed to fetch group details");

    const group = await groupRes.json();
    if (!group?._id) throw new Error("Missing authentication or group ID.");

    const response = await fetch(
      `http://localhost:5000/api/groups/${group._id}/addMember`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok)
      throw new Error(
        (await response.json()).message || "Failed to add member"
      );

    alert("Member added successfully");
    fetchAndRender(); // Refresh to reflect the new member
  } catch (error) {
    console.error("Error adding member:", error);
    alert(error.message || "Failed to add member.");
  }
};
const createGroup = async (name) => {
  try {
    const response = await fetch("http://localhost:5000/api/groups", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error("Failed to create group!");
    await fetchAndRender();
  } catch (error) {
    console.error("Error creating group:", error);
    alert("Failed to create group.");
  }
};
const submitNewGroup = () => {
  const input = document.getElementById("newGroupName");
  const name = input.value.trim();
  if (!name) return alert("Please enter a name.");
  createGroup(name);
  // Clear input field safely
  input.value = "";
  closeModal("createGroupModal");
};
const submitNewRoommate = () => {
  const input = document.getElementById("newRoommateEmail");
  const email = input.value.trim();
  if (!email) return alert("Please enter an email.");
  addMember(email);
  // Clear the input field
  input.value = "";
  closeModal("addRoommateModal");
};
const submitNewTask = () => {
  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const memberId = document.getElementById("options").value;
  const groups = JSON.parse(sessionStorage.getItem("groupData"));
  const dueDate = document.getElementById("taskDeadline").value;
  if (![title, description, memberId].every(Boolean)) {
    return alert("Please fill in all fields.");
  }
  addTask(title, description, memberId, dueDate, groups);
  // Reset modal inputs efficiently
  ["taskTitle", "taskDescription", "taskDeadline"].forEach(
    (id) => (document.getElementById(id).value = "")
  );
  closeModal("addTaskModal");
};
const removeOldTasks = (tasks) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 days

  tasks.forEach((task) => {
    if (new Date(task.createdAt) <= cutoffDate && task.completed === true) {

      removeTask(null, task);
    }
  });
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
