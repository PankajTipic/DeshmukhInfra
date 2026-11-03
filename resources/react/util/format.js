/**
 * Formats a quantity value:
 * - When 3 decimals are entered/present (e.g. 19.123), show 3 decimals (no round off).
 * - When 2 decimals are entered/present (e.g. 19.12), show 2 decimals.
 * - Otherwise default to 2 decimals (e.g. 19 -> 19.00, 19.5 -> 19.50).
 */
export const formatQty = (val) => {
  if (val === null || val === undefined || val === '') return '';
  const num = parseFloat(val);
  if (isNaN(num)) return '';

  const str = String(val).trim();
  const parts = str.split('.');

  if (parts.length > 1) {
    const decimals = parts[1];
    // If it has 3 decimals
    if (decimals.length >= 3) {
      // If trailing 0 (such as MySQL returning "19.120" for 19.12)
      if (decimals.length === 3 && decimals[2] === '0') {
        return num.toFixed(2);
      }
      return num.toFixed(3);
    }
    return num.toFixed(2);
  }

  // Integer without decimal point (e.g. "19" -> "19.00")
  return num.toFixed(2);
};
