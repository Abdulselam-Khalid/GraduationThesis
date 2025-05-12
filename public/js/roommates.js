const token = sessionStorage.getItem("token");
const userData = JSON.parse(sessionStorage.getItem("userData"));
const groupData = JSON.parse(sessionStorage.getItem("groupData"));

const renderMembers = async (groups) => {
  const crtBtn = document.getElementById("create-button");
  if (crtBtn) crtBtn.remove();
  const list = document.getElementById("names-list");
  list.innerHTML = ""; // Clear the list before rendering

  // Create a table element
  const table = document.createElement("table");
  table.classList.add("members-table"); // Add a class to style the table

  // Create the table header
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `
    <th>Names</th>
    <th>Email</th>
    ${groups.createdBy == userData.id ? `<th>Action</th>` : ""}
    
  `;
  table.appendChild(headerRow);

  // Loop through each group
  groups.members.forEach((member) => {
    const row = document.createElement("tr");

    // Create the columns for each member
    row.innerHTML = `
        <td>${member.name}</td>
        <td>${member.email}</td>
        ${
          groups.createdBy == userData.id
            ? `${
                groups.createdBy != member._id
                  ? `<td><button id="remove-member" class="remove-btn" data-group-id="${groups._id}" data-id="${member._id}">X</button></td>`
                  : `<td>Admin</td>`
              }`
            : ""
        }
      `;
    table.appendChild(row); // Append the row with member info
  });

  list.appendChild(table); // Add the table to the list container
  if (!document.querySelector("#add-roommate-button")) {
    const button = document.createElement("button");
    button.innerHTML = "Add Roommate";
    button.classList = "add-btn";
    button.id = "add-roommate-button";
    const section = document.querySelector(".names-card");
    if (groups.createdBy == userData.id) {
      section.appendChild(button);
    }
    document.querySelectorAll("#add-roommate-button").forEach((button) => {
      button.addEventListener("click", () => openModal("addRoommateModal"));
    });
  }

  if (!document.querySelector("#leave-group-button")) {
    const button = document.createElement("button");
    button.innerHTML = "Leave Group";
    button.classList = "leave-btn";
    button.id = "leave-group-button";
    const section = document.querySelector(".names-card");
    section.appendChild(button);
    document.querySelectorAll("#leave-group-button").forEach((button) => {
      button.addEventListener("click", () => {
        openModal("confirmModal");
        document.getElementById("confirmHeader").textContent = `Confirm`;
        document.getElementById(
          "confirmMessage"
        ).textContent = `Are you sure you want to leave "${groups.name}"?`;
        const confirmYes = document.getElementById("confirmYes");
        const confirmNo = document.getElementById("confirmNo");

        // Remove previous event listeners to prevent duplication
        confirmYes.replaceWith(confirmYes.cloneNode(true));
        confirmNo.replaceWith(confirmNo.cloneNode(true));

        document
          .getElementById("confirmYes")
          .addEventListener("click", () => leaveGroup(groups));
        document
          .getElementById("confirmNo")
          .addEventListener("click", () => closeModal("confirmModal"));
      });
    });
  }

  document.querySelectorAll("#remove-member").forEach((button) => {
    button.addEventListener("click", (e) => {
      openModal("confirmModal");
      document.getElementById("confirmHeader").textContent = `Confirm`;
      document.getElementById(
        "confirmMessage"
      ).textContent = `Are you sure you want to remove this member?`;
      const confirmYes = document.getElementById("confirmYes");
      const confirmNo = document.getElementById("confirmNo");

      // Remove previous event listeners to prevent duplication
      confirmYes.replaceWith(confirmYes.cloneNode(true));
      confirmNo.replaceWith(confirmNo.cloneNode(true));

      document
        .getElementById("confirmYes")
        .addEventListener("click", () => removeMember(e));
      document
        .getElementById("confirmNo")
        .addEventListener("click", () => closeModal("confirmModal"));
    });
  });
};
const renderTasks = (tasks, groups) => {
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
          <p>${task.description || ""}</p>
          <p>Assigned to: <b>${task.assignedTo.name || ""}</b></p>
          </span>
          <span>
          ${
            !task.completed
              ? `<strong>${formatDate(task.dueDate) || ""}</strong>`
              : "<strong>Done  </strong>"
          }
        ${
          task.assignedTo.name == userData.name
            ? `${
                task.completed === false
                  ? `<button data-id="${task._id}" class="completed-task-btn">Complete</button>`
                  : ""
              }`
            : ""
        }
        ${
          userData.id == groups.createdBy
            ? `<button data-id="${task._id}" id="remove-task" class="remove-btn">X</button>`
            : ""
        }
          
        </span>
      `;

    list.appendChild(li);
  });
  if (!document.querySelector("#add-task-btn")) {
    const button = document.createElement("button");
    button.innerHTML = "Add Task";
    button.classList = "add-btn";
    button.id = "add-task-btn";
    const section = document.querySelector(".tasks-card");
    if (groups.createdBy == userData.id) {
      section.appendChild(button);
      const addTaskBtn = document.querySelector("#add-task-btn");
      addTaskBtn
        ? addTaskBtn.addEventListener("click", async () => {
            openModal("addTaskModal");
            const groups = JSON.parse(sessionStorage.getItem("groupData"));
            const select = document.getElementById("options");

            // Remove all existing options
            select.innerHTML = "";

            // Re-add the default option
            const defaultOption = document.createElement("option");
            defaultOption.innerHTML = "Select a member";
            defaultOption.value = ""; // Keeps it as a placeholder
            select.appendChild(defaultOption);

            // Add group members dynamically
            groups.members.forEach((member) => {
              const nameOption = document.createElement("option");
              nameOption.value = member._id;
              nameOption.innerHTML = member.name;
              select.appendChild(nameOption);
            });
          })
        : ``;
    }
  }
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
    let response = await fetch(`http://localhost:5000/api/groups`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch group details");
    }

    const groups = await response.json();
    sessionStorage.setItem("groupData", JSON.stringify(groups));

    // ✅ Handle case where no groups exist
    if (!groups) {
      document.getElementById("names-list").innerHTML =
        "<p>No group found. Please join or create a group.</p>";
      const createBtn = document.createElement("button");
      createBtn.classList = "add-btn";
      createBtn.id = "create-button";
      createBtn.innerHTML = "Create Group";
      document.querySelector(".names-card").appendChild(createBtn);
      createBtn.addEventListener("click", () => openModal("createGroupModal"));
      document.getElementById("tasks-list").innerHTML =
        "<p>No tasks to show.</p>";
      return;
    }

    renderMembers(groups);

    response = await fetch(
      `http://localhost:5000/api/groups/${groups._id}/tasks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }

    const tasks = await response.json();
    renderTasks(tasks, groups);
  } catch (error) {
    console.error("Error loading tasks or members:", error);
    document.getElementById("tasks-list").innerHTML =
      "<p>Error loading tasks.</p>";
    document.getElementById("names-list").innerHTML =
      "<p>Error loading members.</p>";
  }
};
const addTask = async (title, description, memberId, dueDate) => {
  if (!token) {
    alert("You must be logged in to add a task.");
    return;
  }
  let taskData = {
    title: title,
    description: description,
    assignedTo: memberId,
    groupId: groupData._id,
  };

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
      method: "PUT",
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
const leaveGroup = async (groups) => {
  if (groups.createdBy == userData.id) {
    document.getElementById("confirmHeader").textContent = `Alert`;
    document.getElementById(
      "confirmMessage"
    ).textContent = `As an admin, leaving the group will mean the termination of the group. Are you sure you want to leave the group?`;
    const confirmYes = document.getElementById("confirmYes");
    const confirmNo = document.getElementById("confirmNo");

    // Remove previous event listeners to prevent duplication
    confirmYes.replaceWith(confirmYes.cloneNode(true));
    confirmNo.replaceWith(confirmNo.cloneNode(true));

    document
      .getElementById("confirmYes")
      .addEventListener("click", () => deleteGroup(groups));
    document
      .getElementById("confirmNo")
      .addEventListener("click", () => closeModal("confirmModal"));

    return;
  }
  try {
    // Call the API to remove the member and delete their tasks
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

    if (!response.ok) {
      throw new Error("Failed to remove member and delete tasks");
    }

    alert(`You have left "${groups.name}" and your tasks have been deleted.`);
    document.getElementById("leave-group-button").remove();
    document.getElementById("add-roommate-button")
      ? document.getElementById("add-roommate-button").remove()
      : "";
    closeModal("confirmModal");
    // Refresh the tasks and members UI
    await fetchAndRender(); // This should refresh the UI to reflect changes
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
    if (!response.ok) {
      throw new Error("Failed to delete group");
    }
    alert(`You have left "${groups.name}" and the group has been deleted.`);
    document.getElementById("leave-group-button").remove();
    document.getElementById("add-roommate-button").remove();
    document.getElementById("add-task-btn").remove();
    closeModal("confirmModal");
    fetchAndRender();
  } catch (error) {
    console.error({ error });
  }
};
const removeMember = async (e) => {
  const memberId = e.target.dataset.id;
  const groupId = e.target.dataset.groupId;

  // You can now send both IDs to your backend:
  try {
    const response = await fetch(
      `http://localhost:5000/api/groups/${groupId}/members/${memberId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to remove member");
    }
    closeModal("confirmModal");
    await fetchAndRender(); // Refresh UI
  } catch (error) {
    console.error("Error removing member:", error);
    alert("Could not remove the member.");
  }
};
const addMember = async (email) => {
  if (!email) return;

  try {
    const groups = await fetch("http://localhost:5000/api/groups", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const group = await groups.json();
    if (!token || !group._id) {
      alert("Missing authentication or group ID.");
      return;
    }

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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add member");
    }

    alert("Member added successfully");
    fetchAndRender(); // Refresh to reflect the new member
  } catch (error) {
    console.error("Error adding member:", error);
    alert(`${error}`);
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
      body: JSON.stringify({
        name: name,
      }),
    });
    if (!response.ok) {
      alert("Failed to create group!");
    }
    await fetchAndRender();
  } catch (error) {
    console.error(error);
  }
};
const submitNewGroup = () => {
  const name = document.getElementById("newGroupName").value.trim();
  if (!name) {
    alert("Please enter a name.");
    return;
  }
  createGroup(name);
  document.getElementById("newGroupName").value = "";
  closeModal("createGroupModal");
};
const submitNewRoommate = () => {
  const email = document.getElementById("newRoommateEmail").value.trim();
  if (!email) {
    alert("Please enter an email.");
    return;
  }
  addMember(email);
  document.getElementById("newRoommateEmail").value = "";
  closeModal("addRoommateModal");
};
const submitNewTask = () => {
  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const memberId = document.getElementById("options").value;
  let dueDate = "";
  dueDate = document.getElementById("taskDeadline").value;

  if (!title || !description || !memberId) {
    alert("Please fill in all fields.");
    return;
  }

  addTask(title, description, memberId, dueDate);

  // Reset modal inputs
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDescription").value = "";
  document.getElementById("taskDeadline").value = "";

  closeModal("addTaskModal");
};
const optionElements = async () => {
  const groups = JSON.parse(sessionStorage.getItem("groupData"));
  const select = document.getElementById("options");

  // Remove all existing options
  select.innerHTML = "";

  // Re-add the default option
  const defaultOption = document.createElement("option");
  defaultOption.innerHTML = "Select a member";
  defaultOption.value = ""; // Keeps it as a placeholder
  select.appendChild(defaultOption);

  // Add group members dynamically
  groups.members.forEach((member) => {
    const nameOption = document.createElement("option");
    nameOption.value = member._id;
    nameOption.innerHTML = member.name;
    select.appendChild(nameOption);
  });
};
// Close modals if user clicks outside content

document.addEventListener("DOMContentLoaded", async () => {
  await fetchAndRender();
});
