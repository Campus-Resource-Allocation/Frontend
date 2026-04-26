// ============================================================
// api_config.js
// central place for base URL and auth headers
// all service files import from here
// if backend URL changes just update it here
// ============================================================

const BASE_URL = "http://localhost:5000/api";

// get the JWT token from localStorage
// this token is saved when user logs in
const get_token = () => {
    return localStorage.getItem("token");
};

// get the full user object from localStorage
// saved during login as JSON string
const get_user = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

// build auth headers with JWT token
// every protected API call needs this
const auth_headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${get_token()}`,
});

export { BASE_URL, get_token, get_user, auth_headers };