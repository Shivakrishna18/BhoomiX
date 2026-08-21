/**
 * Indian Rupee (INR) Formatting and Parsing Utilities for BhoomiX
 * Supports canonical integer storage in INR and standard Indian Numbering System representations:
 * Thousands (₹1,000), Lakhs (₹1,00,000 / ₹1.50 L), Crores (₹1,00,00,000 / ₹2.50 Cr).
 */

/**
 * Formats a raw number into standard Indian comma-separated notation.
 * e.g., 1250000 -> "12,50,000"
 */
export function formatIndianNumber(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return '0';
  const numStr = Math.round(Math.abs(val)).toString();
  const sign = val < 0 ? '-' : '';

  if (numStr.length <= 3) {
    return sign + numStr;
  }

  const lastThree = numStr.substring(numStr.length - 3);
  const remaining = numStr.substring(0, numStr.length - 3);

  // Group the remaining digits in pairs of 2
  const groupedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return sign + groupedRemaining + ',' + lastThree;
}

/**
 * Formats a canonical INR amount into a clean, readable display string with ₹ symbol.
 * Automatically adapts between full comma format, Lakhs (L), and Crores (Cr).
 *
 * Examples:
 * - 5000 -> "₹5,000"
 * - 25000 -> "₹25,000"
 * - 125000 -> "₹1.25 Lakh" (or "₹1,25,000" if full=true)
 * - 1250000 -> "₹12.50 Lakh"
 * - 2500000 -> "₹25 Lakh"
 * - 12500000 -> "₹1.25 Crore"
 * - 25000000 -> "₹2.50 Crore"
 */
export function formatINR(
  val?: number | null,
  options?: {
    compact?: boolean; // Default: true for large amounts
    showUnit?: boolean; // Default: true (shows Lakh / Crore or L / Cr)
    shortUnit?: boolean; // Use 'L' / 'Cr' instead of 'Lakh' / 'Crore'
  }
): string {
  if (val === undefined || val === null || isNaN(val) || val === 0) {
    return '₹0';
  }

  const absVal = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  const short = options?.shortUnit ?? true;

  // Crores (>= 1,00,00,000)
  if (absVal >= 10000000) {
    const crValue = absVal / 10000000;
    // Format to 2 decimal places, remove trailing zeros if clean
    const formatted = crValue % 1 === 0 ? crValue.toFixed(0) : crValue.toFixed(2).replace(/\.?0+$/, '');
    const unit = short ? 'Cr' : crValue === 1 ? 'Crore' : 'Crores';
    return `${sign}₹${formatted} ${unit}`;
  }

  // Lakhs (>= 1,00,000)
  if (absVal >= 100000) {
    const lakhValue = absVal / 100000;
    const formatted = lakhValue % 1 === 0 ? lakhValue.toFixed(0) : lakhValue.toFixed(2).replace(/\.?0+$/, '');
    const unit = short ? 'L' : lakhValue === 1 ? 'Lakh' : 'Lakhs';
    return `${sign}₹${formatted} ${unit}`;
  }

  // Standard Thousands / Hundreds
  return `${sign}₹${formatIndianNumber(absVal)}`;
}

/**
 * Returns the full INR breakdown string for clarity in input helpers.
 * e.g., 12500000 -> "₹1,25,00,000 (₹1.25 Crore)"
 */
export function getINRSpokenSummary(val?: number | null): string {
  if (!val || isNaN(val) || val <= 0) return '₹0';
  const fullNum = `₹${formatIndianNumber(val)}`;
  if (val >= 10000000) {
    const cr = (val / 10000000).toFixed(2).replace(/\.?0+$/, '');
    return `${fullNum} (${cr} Crore${parseFloat(cr) > 1 ? 's' : ''})`;
  }
  if (val >= 100000) {
    const lk = (val / 100000).toFixed(2).replace(/\.?0+$/, '');
    return `${fullNum} (${lk} Lakh${parseFloat(lk) > 1 ? 's' : ''})`;
  }
  return fullNum;
}

/**
 * Clean and convert raw user price text to canonical INR integer number.
 * Validates against NaN, negative numbers, and invalid characters.
 */
export function parsePriceToCanonicalINR(input: string | number): number {
  if (typeof input === 'number') {
    return isNaN(input) || input < 0 ? 0 : Math.round(input);
  }
  if (!input || typeof input !== 'string') return 0;

  // Remove currency symbols, commas, spaces
  const cleaned = input.replace(/[₹,\s]/g, '').trim();
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed) || parsed < 0) return 0;
  return Math.round(parsed);
}
