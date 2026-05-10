export function validateListName(name: string) {
  if (!name.trim()) {
    return 'validation.requiredListName';
  }
  return null;
}
