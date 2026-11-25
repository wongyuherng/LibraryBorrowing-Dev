const {
  validateRegistration,
  validateLogin
} = require('../src/validators');

describe('User Service Validation', () => {
  test('should accept valid registration details', () => {
    expect(
      validateRegistration(
        'student@example.com',
        'password123',
        'Test Student'
      )
    ).toBeNull();
  });

  test('should reject missing registration details', () => {
    expect(
      validateRegistration('', 'password123', 'Test Student')
    ).toBe('Email, password, and full name are required');
  });

  test('should reject a password shorter than 8 characters', () => {
    expect(
      validateRegistration(
        'student@example.com',
        '12345',
        'Test Student'
      )
    ).toBe('Password must be at least 8 characters');
  });

  test('should accept valid login details', () => {
    expect(
      validateLogin('student@example.com', 'password123')
    ).toBeNull();
  });

  test('should reject missing login details', () => {
    expect(
      validateLogin('', 'password123')
    ).toBe('Email and password are required');
  });
});
