import fs from "node:fs";
import path from "node:path";

const rawDir = path.join("data", "raw");
fs.mkdirSync(rawDir, { recursive: true });

const channels = ["Online", "Retail Store", "Marketplace"];
const regions = ["Northeast", "Midwest", "South", "West"];
const categories = [
  { name: "Home Office", basePrice: 175, margin: 0.42 },
  { name: "Kitchen", basePrice: 95, margin: 0.38 },
  { name: "Fitness", basePrice: 145, margin: 0.36 },
  { name: "Travel", basePrice: 120, margin: 0.34 },
  { name: "Electronics", basePrice: 260, margin: 0.29 }
];
const segments = ["New", "Returning", "Loyalty"];

function random(seed) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

const rand = random(4217);
const pick = (items) => items[Math.floor(rand() * items.length)];
const money = (value) => Number(value.toFixed(2));
const dateIso = (date) => date.toISOString().slice(0, 10);

const customers = Array.from({ length: 1200 }, (_, index) => {
  const signup = new Date(2024, Math.floor(rand() * 12), 1 + Math.floor(rand() * 27));
  return {
    customer_id: `C${String(index + 1).padStart(5, "0")}`,
    region: pick(regions),
    segment: pick(segments),
    signup_date: dateIso(signup)
  };
});

const orders = [];
for (let month = 0; month < 18; month += 1) {
  const monthDate = new Date(2024, month, 1);
  const seasonality = 1 + (monthDate.getMonth() === 10 || monthDate.getMonth() === 11 ? 0.32 : 0);
  const demand = Math.round((520 + month * 24) * seasonality);

  for (let i = 0; i < demand; i += 1) {
    const category = pick(categories);
    const customer = pick(customers);
    const channel = pick(channels);
    const units = 1 + Math.floor(rand() * 4);
    const discountRate = channel === "Marketplace" ? 0.13 + rand() * 0.1 : rand() * 0.16;
    const price = category.basePrice * (0.85 + rand() * 0.38);
    const revenue = money(price * units * (1 - discountRate));
    const cost = money(revenue * (1 - category.margin + rand() * 0.05));
    const orderDate = new Date(2024, month, 1 + Math.floor(rand() * 27));

    orders.push({
      order_id: `O${String(orders.length + 1).padStart(6, "0")}`,
      order_date: dateIso(orderDate),
      customer_id: customer.customer_id,
      region: customer.region,
      channel,
      category: category.name,
      units,
      revenue,
      cost,
      discount_rate: Number(discountRate.toFixed(3)),
      fulfillment_days: 1 + Math.floor(rand() * (channel === "Online" ? 8 : 5))
    });
  }
}

function toCsv(rows) {
  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) => headers.map((header) => row[header]).join(","));
  return `${headers.join(",")}\n${lines.join("\n")}\n`;
}

fs.writeFileSync(path.join(rawDir, "customers.csv"), toCsv(customers));
fs.writeFileSync(path.join(rawDir, "orders.csv"), toCsv(orders));
console.log(`Generated ${customers.length} customers and ${orders.length} orders.`);
