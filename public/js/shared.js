// shared.js
const token = sessionStorage.getItem("token");
const userData = JSON.parse(sessionStorage.getItem("userData"));
const groupData = JSON.parse(sessionStorage.getItem("groupData"));
const usernameElement = document.querySelector(".profile-name");
let userName = userData.name;

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
  const modal = document.getElementById(modalId);
  modal.style.display = "block";
  modal.setAttribute("tabindex", "-1");
  modal.focus();
}
function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}
const alert = (message) => {
  openModal("alertModal");
  document.getElementById("alertBody").textContent = message;
};
const formatDate = (dueDate) => {
  if (!dueDate) return;
  const formattedDate = new Date(dueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return formattedDate;
};
const showConfirmationModal = ({
  message,
  confirmText = "Yes",
  cancelText = "No",
  onConfirm,
}) => {
  openModal("confirmModal");

  document.getElementById("confirmHeader").textContent = "Confirm";
  document.getElementById("confirmMessage").textContent = message;

  ["confirmYes", "confirmNo"].forEach((id) => {
    const button = document.getElementById(id);
    button.replaceWith(button.cloneNode(true)); // Prevent duplicate listeners
  });

  document.getElementById("confirmYes").textContent = confirmText;
  document.getElementById("confirmNo").textContent = cancelText;

  document.getElementById("confirmYes").addEventListener("click", onConfirm);
  document
    .getElementById("confirmNo")
    .addEventListener("click", () => closeModal("confirmModal"));
};
window.onclick = function (event) {
  const addRoommateModal = document.getElementById("addRoommateModal");
  const addTaskModal = document.getElementById("addTaskModal");
  const createGroupModal = document.getElementById("createGroupModal");
  const confirmModal = document.getElementById("confirmModal");
  const alertModal = document.getElementById("alertModal");
  const addTransactionModal = document.getElementById("addTransactionModal");

  if (event.target === addRoommateModal) closeModal("addRoommateModal");
  if (event.target === createGroupModal) closeModal("createGroupModal");
  if (event.target === addTaskModal) closeModal("addTaskModal");
  if (event.target === confirmModal) closeModal("confirmModal");
  if (event.target === alertModal) closeModal("alertModal");
  if (event.target === addTransactionModal) closeModal("addTransactionModal");
};
const fetchAndStoreImage = async () => {
  try {
    const response = await fetch(`http://localhost:5000/api/uploads`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch image");

    const blob = await response.blob();
    const base64String = await blobToBase64(blob);

    // Update image source immediately
    document.getElementById("faceavatar").src = base64String;

    // Store image in sessionStorage to avoid delays
    sessionStorage.setItem("image", base64String);
  } catch (error) {
    console.error("Error fetching image:", error);

    // Provide a fallback avatar in case of failure
    document.getElementById("faceavatar").src = "/assets/pfp.png";
  }
};

// Convert Blob to Base64
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Load image instantly from cache if available
document.addEventListener("DOMContentLoaded", () => {
  const storedImage = sessionStorage.getItem("image");
  if (storedImage) {
    document.getElementById("faceavatar").src = storedImage;
  } else {
    fetchAndStoreImage();
  }
});


document.addEventListener("DOMContentLoaded", async () => {
  await groups();
  fetchAndStoreImage()
  document.getElementById("faceavatar").addEventListener("error", function() {
    this.src = "/assets/pfp.png"; // Fallback image
  });
});
