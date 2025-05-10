document.addEventListener("DOMContentLoaded", function () {
  const userForm = document.getElementById("user-form");
  if (!userForm) return;

  const cancelBtn = document.getElementById("cancel-btn");
  const usersTable = document
    .getElementById("users-table")
    ?.getElementsByTagName("tbody")[0];
  if (!usersTable) return;

  let editingUserId = null;

  // Load users
  loadUsers();

  // Form submission
  userForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const userData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value || null,
    };

    try {
      if (editingUserId) {
        await window.api.updateUser(editingUserId, userData);
      } else {
        await window.api.createUser(userData);
      }
      resetForm();
      await loadUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Failed to save user: " + error.message);
    }
  });

  // Cancel button
  cancelBtn.addEventListener("click", resetForm);

  // Load users into table
  async function loadUsers() {
    try {
      const users = await window.api.fetchUsers();
      usersTable.innerHTML = "";

      users.forEach((user) => {
        const row = usersTable.insertRow();

        row.insertCell().textContent = user.id;
        row.insertCell().textContent = user.name;
        row.insertCell().textContent = user.email;
        row.insertCell().textContent = user.phone || "N/A";

        const actionsCell = row.insertCell();

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "action-btn edit-btn";
        editBtn.addEventListener("click", () => editUser(user));
        actionsCell.appendChild(editBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "action-btn delete-btn";
        deleteBtn.addEventListener("click", () => deleteUserHandler(user.id));
        actionsCell.appendChild(deleteBtn);
      });
    } catch (error) {
      console.error("Error loading users:", error);
      alert("Failed to load users: " + error.message);
    }
  }

  // Edit user
  async function editUser(user) {
    editingUserId = user.id;
    document.getElementById("user-id").value = user.id;
    document.getElementById("name").value = user.name;
    document.getElementById("email").value = user.email;
    document.getElementById("phone").value = user.phone || "";

    document.getElementById("save-btn").textContent = "Update User";
    cancelBtn.style.display = "inline-block";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Delete user
  async function deleteUserHandler(id) {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await window.api.deleteUser(id);
        await loadUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user: " + error.message);
      }
    }
  }

  // Reset form
  function resetForm() {
    userForm.reset();
    document.getElementById("user-id").value = "";
    editingUserId = null;
    document.getElementById("save-btn").textContent = "Save User";
    cancelBtn.style.display = "none";
  }
});
