const token = sessionStorage.getItem("token");
const userData = JSON.parse(sessionStorage.getItem("userData"));
const groupData = JSON.parse(sessionStorage.getItem("groupData"));

// async function renderMembers(groups) {
//   const list = document.getElementById("names-list");
//   list.innerHTML = ""; // Clear the list before rendering

//   // Loop through each group
//   for (const group of groups) {
//     const groupLi = document.createElement("li");
//     groupLi.classList.add('group-li'); // Add a class to style the group
//     groupLi.innerHTML = `<h3>${group.name}</h3><br>`;

//     // Loop through each member and add their name
//     group.members.forEach((member) => {
//       const memberLi = document.createElement("li");
//       memberLi.classList.add('member-li'); // Add a class to style the member
//       memberLi.innerHTML = `<p>${member.name}</p>`;
//       groupLi.appendChild(memberLi); // Add the member name as a sublist under the group
//     });

//     list.appendChild(groupLi); // Add the group (with all members) to the list
//   }
// }

async function renderMembers(groups) {
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
    document.querySelectorAll(".add-btn").forEach((button) => {
      button.addEventListener("click", addMember);
    });
  }
  if (userData.id != groups.createdBy) {
    if (!document.querySelector("#leave-group-button")) {
      const button = document.createElement("button");
      button.innerHTML = "Leave Group";
      button.classList = "leave-btn";
      button.id = "leave-group-button";
      const section = document.querySelector(".names-card");
      section.appendChild(button);
      document.querySelectorAll("#leave-group-button").forEach((button) => {
        button.addEventListener("click", leaveGroup);
      });
    }
  }
  document.querySelectorAll("#remove-member").forEach((button) => {
    button.addEventListener("click", removeMember);
  });
}
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
          <p>${task.description || ""}</p>
          <small>Assigned to: ${task.assignedTo.name || ""}</small>
        </span>
        <span>
        ${
          task.assignedTo.name == userData.name
            ? `<button data-id="${task._id}" ${
                task.completed === true
                  ? 'class="finished-task-btn"'
                  : 'class="completed-task-btn"'
              }>${task.completed === true ? "Completed" : "Complete"}</button>`
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
  if (!document.querySelector("#add-task-btn")) {
    const button = document.createElement("button");
    button.innerHTML = "Add Task";
    button.classList = "add-btn";
    button.id = "add-task-btn";
    const section = document.querySelector(".tasks-card");
    if (groupData.createdBy == userData.id) {
      section.appendChild(button);
      document.querySelectorAll("#add-task-btn").forEach((button) => {
        button.addEventListener("click", addTask);
      });
    }
  }
  // ✅ Attach event listeners AFTER rendering all tasks
  document.querySelectorAll(".completed-task-btn").forEach((button) => {
    button.addEventListener("click", completeTask);
  });
  document.querySelectorAll("#remove-task").forEach((button) => {
    button.addEventListener("click", removeTask);
  });
}

// async function fetchAndRenderTasks() {
//   if (!token) {
//     window.location.href = "/login.html";
//     return;
//   }
//   try {
//     let response = await fetch(`http://localhost:5000/api/groups`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
//     if (!response) {
//       throw new Error("Failed to fetch group details");
//     }
//     const groups = await response.json();

// // If no group found
// if (!groups || Array.isArray(groups) && groups.length === 0) {
//   document.getElementById("names-list").innerHTML = "<p>No group found. Please join or create a group.</p>";
//   document.getElementById("tasks-list").innerHTML = "<p>No tasks to show.</p>";
//   return;
// }

//     renderMembers(groups);
//     response = await fetch(
//       `http://localhost:5000/api/groups/${groups._id}/tasks`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch tasks");
//     }

//     const tasks = await response.json();
//     renderTasks(tasks);
//   } catch (error) {
//     console.error("Error loading tasks or members:", error);
//   }
// }
async function fetchAndRenderTasks() {
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

    // ✅ Handle case where no groups exist
    if (!groups || (Array.isArray(groups) && groups.length === 0)) {
      document.getElementById("names-list").innerHTML =
        "<p>No group found. Please join or create a group.</p>";
      const createBtn = document.createElement("button");
      createBtn.classList = "add-btn";
      createBtn.id = "create-button";
      createBtn.innerHTML = "Create Group";
      document.querySelector(".names-card").appendChild(createBtn);
      createBtn.addEventListener("click", () => {
        console.log("Add Logic");
      });
      document.getElementById("tasks-list").innerHTML =
        "<p>No tasks to show.</p>";
      return;
    }

    // ✅ If your backend returns a single group object instead of an array
    if (!groups._id) {
      console.warn("No valid group ID found. Cannot fetch tasks.");
      document.getElementById("tasks-list").innerHTML =
        "<p>No group data available.</p>";
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
    renderTasks(tasks);
  } catch (error) {
    console.error("Error loading tasks or members:", error);
    document.getElementById("tasks-list").innerHTML =
      "<p>Error loading tasks.</p>";
    document.getElementById("names-list").innerHTML =
      "<p>Error loading members.</p>";
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
    let response = await fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        description: description,
        assignedTo: member._id,
        groupId: groupData._id,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to add task");
    }
    alert(`Task assigned to ${member.name} successfully`);
    fetchAndRenderTasks();
  } catch (error) {
    console.error(error);
    alert("Failed to add task.");
  }
}

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

const leaveGroup = async (e) => {
  if (!confirm(`Are you sure you want to leave "${groupData.name}"?`)) return;

  try {
    // Call the API to remove the member and delete their tasks
    const response = await fetch(
      `http://localhost:5000/api/groups/${groupData._id}/members/${userData.id}`,
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

    alert(
      `You have left "${groupData.name}" and your tasks have been deleted.`
    );
    const button = document.getElementById("leave-group-button");
    button.remove();
    // Refresh the tasks and members UI
    await fetchAndRenderTasks(); // This should refresh the UI to reflect changes
  } catch (error) {
    console.error("Error removing member and deleting tasks:", error);
    alert("Failed to leave the group.");
  }
};

const removeMember = async (e) => {
  const memberId = e.target.dataset.id;
  const groupId = e.target.dataset.groupId;

  if (!confirm("Are you sure you want to remove this member?")) return;

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

    await fetchAndRenderTasks(); // Refresh UI
  } catch (error) {
    console.error("Error removing member:", error);
    alert("Could not remove the member.");
  }
};
async function addMember() {
  const email = prompt("Enter the email of the member to add:");
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
    fetchAndRenderTasks(); // Refresh to reflect the new member
  } catch (error) {
    console.error("Error adding member:", error);
    alert(`${error}`);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchAndRenderTasks();
});
