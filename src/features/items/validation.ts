export function validateItemName(name: string) {
  if (!name.trim()) {
    return 'validation.requiredItemName';
  }
  return null;
}
