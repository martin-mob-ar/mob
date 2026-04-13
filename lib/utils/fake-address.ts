/**
 * Generate a "fake" address by masking the last 2 digits of the street number
 * and prepending "al".
 *
 * Examples:
 *   "Av Libertador 1567" → "Av Libertador al 1500"
 *   "Honduras 5734"      → "Honduras al 5700"
 *   "Sarmiento 800"      → "Sarmiento al 800"
 *   "Tucumán 12"         → "Tucumán al 00"
 */
export function generateFakeAddress(address: string): string {
  // Match the last group of digits in the address
  const match = address.match(/^(.*\D)(\d+)$/);
  if (!match) return address;

  const [, streetPart, numberStr] = match;

  let maskedNumber: string;
  if (numberStr.length <= 2) {
    maskedNumber = '0'.repeat(numberStr.length);
  } else {
    maskedNumber = numberStr.slice(0, -2) + '00';
  }

  // Remove trailing whitespace from street part before adding "al"
  const street = streetPart.trimEnd();
  return `${street} al ${maskedNumber}`;
}
