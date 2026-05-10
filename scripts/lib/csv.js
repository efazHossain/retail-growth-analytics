import fs from "node:fs";
import path from "node:path";

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function readCsv(filePath) {
  const content = fs.readFileSync(filePath, "utf8").trim();
  if (!content) return [];
  const [headerLine, ...lines] = content.split(/\r?\n/);
  const headers = parseLine(headerLine);
  return lines.map((line) => {
    const values = parseLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

export function writeCsv(filePath, rows) {
  ensureDir(path.dirname(filePath));
  if (rows.length === 0) {
    fs.writeFileSync(filePath, "");
    return;
  }

  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) => headers.map((header) => escapeCell(row[header])).join(","));
  fs.writeFileSync(filePath, `${headers.join(",")}\n${lines.join("\n")}\n`);
}

export function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function parseLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === "\"" && inQuotes && next === "\"") {
      current += "\"";
      i += 1;
    } else if (char === "\"") {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function escapeCell(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll("\"", "\"\"")}"`;
  }
  return text;
}
