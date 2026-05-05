/**
 * Formats a number as currency using standard Indian money format (defaults to INR).
 * 
 * @param value - The numeric amount to format.
 * @param currency - The currency code (default: 'INR').
 * @returns A formatted currency string with exactly two decimal places.
 */
export const formatCurrency = (value: number, currency: string = 'INR') => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    // Fallback if Intl fails or currency code is invalid
    return `${currency} ${value.toFixed(2)}`;
  }
};
