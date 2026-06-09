export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

export const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1
});

export const number = new Intl.NumberFormat("en-US");

export const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1
});

export function signedCurrency(value: number) {
  const formatted = currency.format(Math.abs(value));
  return value < 0 ? `-${formatted}` : formatted;
}
