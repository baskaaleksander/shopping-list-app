import { validateSignIn, validateSignUp } from '../src/features/auth/validation';

describe('Authentication Validation', () => {
  describe('validateSignIn', () => {
    it('returns null for valid credentials', () => {
      expect(validateSignIn({ email: 'test@example.com', password: 'password123' })).toBeNull();
    });

    it('returns error for invalid email', () => {
      expect(validateSignIn({ email: 'invalid-email', password: 'password123' })).toBe('validation.invalidEmail');
      expect(validateSignIn({ email: '', password: 'password123' })).toBe('validation.invalidEmail');
    });

    it('returns error for short password', () => {
      expect(validateSignIn({ email: 'test@example.com', password: '123' })).toBe('validation.shortPassword');
    });
  });

  describe('validateSignUp', () => {
    it('returns null for valid signup details', () => {
      expect(validateSignUp({ email: 'test@example.com', password: 'password123', username: 'testuser' })).toBeNull();
    });

    it('returns error for empty username', () => {
      expect(validateSignUp({ email: 'test@example.com', password: 'password123', username: '  ' })).toBe('validation.requiredUsername');
      expect(validateSignUp({ email: 'test@example.com', password: 'password123', username: '' })).toBe('validation.requiredUsername');
    });

    it('returns error for invalid email in signup', () => {
      expect(validateSignUp({ email: 'invalid-email', password: 'password123', username: 'testuser' })).toBe('validation.invalidEmail');
    });

    it('returns error for short password in signup', () => {
      expect(validateSignUp({ email: 'test@example.com', password: '123', username: 'testuser' })).toBe('validation.shortPassword');
    });
  });
});
