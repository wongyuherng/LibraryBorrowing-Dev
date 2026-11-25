const {
  isValidCartItem,
  isValidUserId
} = require('../src/validators');

describe('Order Service Validation', () => {
  test('should accept a valid cart item', () => {
    expect(
      isValidCartItem('B001', 'Introduction to Programming', 1)
    ).toBe(true);
  });

  test('should reject a cart item with missing information', () => {
    expect(
      isValidCartItem('', 'Introduction to Programming', 1)
    ).toBe(false);
  });

  test('should reject a quantity that is not a positive integer', () => {
    expect(isValidCartItem('B001', 'Programming', 0)).toBe(false);
    expect(isValidCartItem('B001', 'Programming', -1)).toBe(false);
    expect(isValidCartItem('B001', 'Programming', 1.5)).toBe(false);
  });

  test('should accept a valid user ID', () => {
    expect(isValidUserId(1)).toBe(true);
    expect(isValidUserId(25)).toBe(true);
  });

  test('should reject an invalid user ID', () => {
    expect(isValidUserId(0)).toBe(false);
    expect(isValidUserId(-1)).toBe(false);
    expect(isValidUserId(1.5)).toBe(false);
  });
});
