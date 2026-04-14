const intFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export const fmt = (n: number | undefined | null): string => {
  if (n === undefined || n === null || Number.isNaN(n)) return "$0";
  const abs = Math.abs(n);
  return n < 0 ? `-$${intFmt.format(abs)}` : `$${intFmt.format(n)}`;
};

export const pct = (n: number): string => `${(n * 100).toFixed(2)}%`;
