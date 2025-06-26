const profilePicInput = document.getElementById("profilePic");
const profilePicPreview = document.getElementById("profilePicPreview");
const displayNameInput = document.getElementById("displayName");
const emailInput = document.getElementById("email");
const storedImage = sessionStorage.getItem("image");

const userInfo = async () => {
  if (userData) {
    displayNameInput.value = userData.name || "";
    emailInput.value = userData.email || "";
    if (storedImage) profilePicPreview.src = storedImage;
    else fetchAndStoreImage();
  }
  
  const saveButton = document.getElementById("saveButton")
  saveButton.addEventListener("click", () => {
    showConfirmationModal({
        message:"Are you sure you want to save these changes?",
        onConfirm:()=> updateUserInfo()
    })
  })
};

const updateUserInfo = async () => {
    const formData = {
      name: displayNameInput.value,
      email: emailInput.value,
      userId: userData.id,
    };
  
    try {
      // Step 1: Update name and email
      const res = await fetch("http://localhost:5000/api/auth/update", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
  
      // Step 2: Upload profile picture (if selected)
      if (profilePicInput.files && profilePicInput.files.length > 0) {
        const file = profilePicInput.files[0];
        const picData = new FormData();
        picData.append("file", file);
  
        const uploadRes = await fetch("http://localhost:5000/api/uploads", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: picData,
        });
  
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || "Image upload failed");
  
        console.log("Uploaded file info:", uploadData);
      }
  
      sessionStorage.setItem("userData", JSON.stringify(data));
      closeModal("confirmModal");
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.message);
    }
  };
  

document.addEventListener("DOMContentLoaded", () => {
    userInfo()
})