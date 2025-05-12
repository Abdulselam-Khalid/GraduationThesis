// shared.js

const usernameElement = document.querySelector(".profile-name");
let userName = userData.name

if (usernameElement && userName) {
  usernameElement.innerHTML = userName;
}
const groups = async () => {
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
    sessionStorage.setItem("groupData", JSON.stringify(await response.json()));
  } catch (error) {}
};
function openModal(modalId) {
  document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}
const alert = (message) => {
  openModal("alertModal")
  document.getElementById("alertBody").textContent = message
}
const formatDate = (dueDate) => {
  if (!dueDate) return;
  const formattedDate = new Date(dueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return formattedDate;
};
window.onclick = function (event) {
  const addRoommateModal = document.getElementById("addRoommateModal");
  const addTaskModal = document.getElementById("addTaskModal");
  const createGroupModal = document.getElementById("createGroupModal");
  const confirmModal = document.getElementById("confirmModal");
  const alertModal = document.getElementById("alertModal");

  if (event.target === addRoommateModal) closeModal("addRoommateModal");
  if (event.target === createGroupModal) closeModal("createGroupModal");
  if (event.target === addTaskModal) closeModal("addTaskModal");
  if (event.target === confirmModal) closeModal("confirmModal");
  if (event.target === alertModal) closeModal("alertModal");
};
document.addEventListener("DOMContentLoaded", async () => {
  sessionStorage.removeItem("groupData");
  await groups();
});
