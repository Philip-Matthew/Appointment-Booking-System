document.addEventListener("DOMContentLoaded", function () {
  const appointmentForm = document.getElementById("appointment-form");
  if (!appointmentForm) return;

  const cancelBtn = document.getElementById("cancel-appointment-btn");
  const appointmentsTable = document
    .getElementById("appointments-table")
    ?.getElementsByTagName("tbody")[0];
  const userSelect = document.getElementById("user-select");
  if (!appointmentsTable || !userSelect) return;

  let editingAppointmentId = null;

  // Load users and appointments
  Promise.all([loadUsers(), loadAppointments()]).catch((error) => {
    console.error("Initialization error:", error);
    alert("Failed to initialize: " + error.message);
  });

  // Form submission
  appointmentForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const appointmentData = {
      user: { id: parseInt(userSelect.value) },
      serviceType: document.getElementById("service-type").value,
      appointmentDate: document.getElementById("appointment-date").value,
      status: document.getElementById("status").value,
      notes: document.getElementById("notes").value || null,
    };

    try {
      if (editingAppointmentId) {
        await window.api.updateAppointment(
          editingAppointmentId,
          appointmentData
        );
      } else {
        await window.api.createAppointment(appointmentData);
      }
      resetForm();
      await loadAppointments();
    } catch (error) {
      console.error("Error saving appointment:", error);
      alert("Failed to save appointment: " + error.message);
    }
  });

  // Cancel button
  cancelBtn.addEventListener("click", resetForm);

  // Load users into dropdown
  async function loadUsers() {
    try {
      const users = await window.api.fetchUsers();
      userSelect.innerHTML = '<option value="">Select User</option>';

      users.forEach((user) => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = `${user.name} (${user.email})`;
        userSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error loading users:", error);
      throw error;
    }
  }

  // Load appointments into table
  async function loadAppointments() {
    try {
      const appointments = await window.api.fetchAppointments();
      const users = await window.api.fetchUsers();
      const userMap = new Map(users.map((user) => [user.id, user]));

      appointmentsTable.innerHTML = "";

      appointments.forEach((appointment) => {
        const row = appointmentsTable.insertRow();

        row.insertCell().textContent = appointment.id;
        row.insertCell().textContent =
          userMap.get(appointment.user.id)?.name || "Unknown User";
        row.insertCell().textContent = appointment.serviceType;

        const dateCell = row.insertCell();
        const date = new Date(appointment.appointmentDate);
        dateCell.textContent = date.toLocaleString();

        const statusCell = row.insertCell();
        statusCell.textContent = appointment.status;
        statusCell.className = `status-${appointment.status.toLowerCase()}`;

        const actionsCell = row.insertCell();

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "action-btn edit-btn";
        editBtn.addEventListener("click", () => editAppointment(appointment));
        actionsCell.appendChild(editBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "action-btn delete-btn";
        deleteBtn.addEventListener("click", () =>
          deleteAppointmentHandler(appointment.id)
        );
        actionsCell.appendChild(deleteBtn);
      });
    } catch (error) {
      console.error("Error loading appointments:", error);
      throw error;
    }
  }

  // Edit appointment
  async function editAppointment(appointment) {
    editingAppointmentId = appointment.id;
    document.getElementById("appointment-id").value = appointment.id;
    document.getElementById("user-select").value = appointment.user.id;
    document.getElementById("service-type").value = appointment.serviceType;

    // Format date for datetime-local input
    const date = new Date(appointment.appointmentDate);
    const formattedDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);
    document.getElementById("appointment-date").value = formattedDate;

    document.getElementById("status").value = appointment.status;
    document.getElementById("notes").value = appointment.notes || "";

    document.getElementById("save-appointment-btn").textContent =
      "Update Appointment";
    cancelBtn.style.display = "inline-block";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Delete appointment
  async function deleteAppointmentHandler(id) {
    if (confirm("Are you sure you want to delete this appointment?")) {
      try {
        await window.api.deleteAppointment(id);
        await loadAppointments();
      } catch (error) {
        console.error("Error deleting appointment:", error);
      }
    }
  }

  // Reset form
  function resetForm() {
    appointmentForm.reset();
    document.getElementById("appointment-id").value = "";
    editingAppointmentId = null;
    document.getElementById("save-appointment-btn").textContent =
      "Save Appointment";
    cancelBtn.style.display = "none";
  }
});
