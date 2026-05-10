export function groupBy(rows, keyFn, seedFn, reduceFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!map.has(key)) map.set(key, seedFn(row));
    reduceFn(map.get(key), row);
  }
  return [...map.values()];
}

export function sum(rows, field) {
  return Number(rows.reduce((total, row) => total + Number(row[field] || 0), 0).toFixed(2));
}

export function round(value, places = 2) {
  return Number(Number(value || 0).toFixed(places));
}

export function average(rows, field) {
  if (rows.length === 0) return 0;
  return round(sum(rows, field) / rows.length, 2);
}

export function money(value) {
  return `$${Math.round(value).toLocaleString()}`;
}

export function monthDiff(startMonth, endMonth) {
  const [startYear, start] = startMonth.split("-").map(Number);
  const [endYear, end] = endMonth.split("-").map(Number);
  return (endYear - startYear) * 12 + (end - start);
}
