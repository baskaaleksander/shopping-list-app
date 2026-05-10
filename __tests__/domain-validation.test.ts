import { validateListName } from '../src/features/shoppingLists/validation';
import { validateItemName } from '../src/features/items/validation';

describe('Domain Validation', () => {
  describe('validateListName', () => {
    it('returns null for valid name', () => {
      expect(validateListName('Groceries')).toBeNull();
      expect(validateListName('  Groceries  ')).toBeNull();
    });

    it('returns error for empty name', () => {
      expect(validateListName('')).toBe('validation.requiredListName');
      expect(validateListName('   ')).toBe('validation.requiredListName');
    });
  });

  describe('validateItemName', () => {
    it('returns null for valid item name', () => {
      expect(validateItemName('Milk')).toBeNull();
      expect(validateItemName('  Milk  ')).toBeNull();
    });

    it('returns error for empty item name', () => {
      expect(validateItemName('')).toBe('validation.requiredItemName');
      expect(validateItemName('   ')).toBe('validation.requiredItemName');
    });
  });
});
