/**
 * Formats a number as currency.
 * @param value - The numeric amount to format.
 * @param currency - The currency code (default: 'USD').
 * @returns A formatted currency string with exactly two decimal places.
 */
export const formatCurrency = (value: number, currency: string = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    // Fallback if Intl fails or currency code is invalid
    return `${currency} ${value.toFixed(2)}`;
  }
};
