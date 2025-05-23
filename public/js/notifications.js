const userId = userData.id;

async function fetchNotifications() {
  const dropdownList = document.querySelector(
    "#notificationDropdown .notification-list"
  );
  const bellBadge = document.querySelector(".notification-badge");
  const markAllReadButton = document.querySelector(".mark-all-read"); // ✅ Fixed selector (uses class)

  try {
    const res = await fetch(
      `http://localhost:5000/api/notifications/user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const notifications = await res.json();

    // Clear previous entries
    dropdownList.innerHTML = "";

    // Only show unread notifications

    notifications.forEach((n) => {
      const ul = document.createElement("ul");
      ul.className = "notification-item unread";

      ul.innerHTML = `
        <div class="notification-content">
          <p>${n.title}</p>
          <span class="notification-time">${formatTimeAgo(n.createdAt)}</span>
        </div>
      `;

      dropdownList.appendChild(ul);
    });

    // Update the badge
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

    // Mark all as read
    markAllReadButton.addEventListener("click", () => {
      markRead(notifications);
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

const markRead = async (notifications) => {
  try {
    for (const n of notifications) {
      await fetch(`http://localhost:5000/api/notifications/${n._id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    }
    fetchNotifications(); // Refresh after marking as read
  } catch (err) {
    console.error("Error marking notifications as read:", err);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  fetchNotifications();
});
