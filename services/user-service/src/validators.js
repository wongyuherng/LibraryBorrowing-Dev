function validateRegistration(email, password, full_name) {
  if (!email || !password || !full_name) {
    return 'Email, password, and full name are required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  return null;
}

function validateLogin(email, password) {
  if (!email || !password) {
    return 'Email and password are required';
  }

  return null;
}

module.exports = {
  validateRegistration,
  validateLogin
};
