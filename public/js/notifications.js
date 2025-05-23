const userId = userData.id;
const notificationsMap = new Map(); // Store notifications by ID

async function fetchNotifications() {
  const dropdownList = document.querySelector("#notificationDropdown .notification-list");
  const bellBadge = document.querySelector(".notification-badge");
  const markAllReadButton = document.querySelector(".mark-all-read");

  try {
    const res = await fetch(`http://localhost:5000/api/notifications/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const notifications = await res.json();
    notificationsMap.clear();
    dropdownList.innerHTML = "";

    notifications.forEach((n) => {
      notificationsMap.set(n._id, n);

      const ul = document.createElement("ul");
      ul.className = "notification-item unread";
      ul.innerHTML = `
        <div class="notification-content" style="cursor:pointer" data-id="${n._id}">
          <p>${n.title}</p>
          <span class="notification-time">${formatTimeAgo(n.createdAt)}</span>
        </div>
      `;
      dropdownList.appendChild(ul);
    });

    if (notifications.length > 0) {
      bellBadge.textContent = notifications.length;
      bellBadge.style.display = "flex";
    } else {
      bellBadge.style.display = "none";

      const ul = document.createElement("ul");
      ul.className = "notification-item unread";
      ul.innerHTML = `
        <div class="notification-content">
          <p>No new notifications</p>
        </div>
      `;
      dropdownList.appendChild(ul);
    }

    markAllReadButton.addEventListener("click", () => markRead(notifications, null));

    document.querySelectorAll(".notification-content").forEach((div) => {
      div.addEventListener("click", viewNotificationMessage);
    });

  } catch (err) {
    console.error("Error fetching notifications:", err);
  }
}

function formatTimeAgo(timestamp) {
  const now = new Date();
  const created = new Date(timestamp);
  const diff = Math.floor((now - created) / 60000); // in minutes

  if (diff < 1) return "just now";
  if (diff < 60) return `${diff} minute${diff !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

const markRead = async (notifications, notification) => {
  try {
    if (!notifications && notification) {
      // Mark a single notification
      await fetch(`http://localhost:5000/api/notifications/${notification._id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      closeModal("confirmModal");
    } else {
      // Mark all notifications
      for (const n of notifications) {
        await fetch(`http://localhost:5000/api/notifications/${n._id}/read`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    }

    fetchNotifications(); // Refresh UI
  } catch (err) {
    console.error("Error marking notifications as read:", err);
  }
};

const viewNotificationMessage = (e) => {
  const id = e.currentTarget.dataset.id;
  const notification = notificationsMap.get(id);

  if (notification) {
    showConfirmationModal({
      message: notification.message,
      onConfirm: () => markRead(null, notification),
      confirmText: "Mark Read",
      cancelText: "Cancel",
    });
  } else {
    alert("No new notifications");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  fetchNotifications();
});
