/**
 * Utility functions for Indian financial market formatting.
 */

export function formatPrice(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '₹0.00';
  return '₹' + value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPriceChange(change: number, percent: number): { text: string; isPositive: boolean; isNeutral: boolean } {
  const isNeutral = Math.abs(change) < 0.001;
  const isPositive = change > 0;
  const sign = isPositive ? '+' : '';
  const text = `${sign}₹${Math.abs(change).toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
  return { text, isPositive, isNeutral };
}

export function formatVolume(volume: number): string {
  if (!volume || isNaN(volume)) return '0';
  if (volume >= 1_000_000_000) {
    return (volume / 1_000_000_000).toFixed(1) + 'B';
  }
  if (volume >= 1_000_000) {
    return (volume / 1_000_000).toFixed(1) + 'M';
  }
  if (volume >= 1_000) {
    return (volume / 1_000).toFixed(1) + 'K';
  }
  return volume.toLocaleString('en-IN');
}

export function formatRVOL(rvol: number): string {
  if (!rvol || isNaN(rvol)) return '100%';
  return `${Math.round(rvol * 100)}%`;
}

export function formatTime(epochSeconds: number | null | undefined): string {
  if (!epochSeconds) return '--:--:--';
  const date = new Date(epochSeconds * 1000);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}
