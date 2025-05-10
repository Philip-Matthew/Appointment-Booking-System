const API_BASE_URL = "http://localhost:8080/api";

async function makeApiCall(endpoint, method = "GET", body = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `API request failed with status ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
}

// User API functions
async function fetchUsers() {
  return makeApiCall("/users");
}

async function fetchUser(id) {
  return makeApiCall(`/users/${id}`);
}

async function createUser(userData) {
  return makeApiCall("/users", "POST", userData);
}

async function updateUser(id, userData) {
  return makeApiCall(`/users/${id}`, "PUT", userData);
}

async function deleteUser(id) {
  return makeApiCall(`/users/${id}`, "DELETE");
}

// Appointment API functions
async function fetchAppointments() {
  return makeApiCall("/appointments");
}

async function fetchAppointment(id) {
  return makeApiCall(`/appointments/${id}`);
}

async function fetchUserAppointments(userId) {
  return makeApiCall(`/appointments/user/${userId}`);
}

async function createAppointment(appointmentData) {
  return makeApiCall("/appointments", "POST", appointmentData);
}

async function updateAppointment(id, appointmentData) {
  return makeApiCall(`/appointments/${id}`, "PUT", appointmentData);
}

async function deleteAppointment(id) {
  return makeApiCall(`/appointments/${id}`, "DELETE");
}

// Make functions available globally
window.api = {
  fetchUsers,
  fetchUser,
  createUser,
  updateUser,
  deleteUser,
  fetchAppointments,
  fetchAppointment,
  fetchUserAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
