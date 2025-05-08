// shared.js

const usernameElement = document.querySelector(".profile-name");
let userName = sessionStorage.getItem("userName");

if (usernameElement && userName) {
  userName = userName.replace(/"/g, "");
  userName = userName.slice(0, 1).toUpperCase() + userName.slice(1);
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

document.addEventListener("DOMContentLoaded", async () => {
  sessionStorage.removeItem("groupData");
  await groups();
});
