const { isValidBookId } = require('../src/validators');

describe('Book Service Validation', () => {
  test('should accept a valid book ID', () => {
    expect(isValidBookId('1')).toBe(true);
    expect(isValidBookId('25')).toBe(true);
  });

  test('should reject an invalid book ID', () => {
    expect(isValidBookId('0')).toBe(false);
    expect(isValidBookId('-1')).toBe(false);
    expect(isValidBookId('abc')).toBe(false);
    expect(isValidBookId('1.5')).toBe(false);
  });
});
