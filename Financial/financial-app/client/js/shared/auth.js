/**
 * Authentication Helper
 * Provides JWT token management and authentication utilities
 */

function getToken() {
  return localStorage.getItem('jwt_token');
}

function isAuthenticated() {
  return !!getToken();
}

function redirectIfNotAuthenticated() {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
  }
}

function setToken(token) {
  localStorage.setItem('jwt_token', token);
}

function clearToken() {
  localStorage.removeItem('jwt_token');
}

function getUserEmail() {
  return localStorage.getItem('user_email');
}

function setUserEmail(email) {
  localStorage.setItem('user_email', email);
}

/**
 * API call wrapper with authentication
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise} - JSON response or throws error
 */
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        clearToken();
        window.location.href = '/login.html';
        return;
      }

      const error = await response.json();
      throw new Error(error.message || 'API call failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Export for use in other scripts
window.AuthHelper = {
  getToken,
  isAuthenticated,
  redirectIfNotAuthenticated,
  setToken,
  clearToken,
  getUserEmail,
  setUserEmail,
  apiCall
};
