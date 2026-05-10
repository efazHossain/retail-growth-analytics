import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = process.cwd();
const port = process.env.PORT || 4173;
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url === "/" ? "/dashboard/index.html" : request.url, `http://localhost:${port}`);
  const requestPath = decodeURIComponent(requestUrl.pathname);
  const cleanPath = path.normalize(requestPath).replace(/^([/\\])+/, "");
  const filePath = path.join(root, cleanPath);

  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "Content-Type": contentTypes[path.extname(filePath)] || "text/plain; charset=utf-8" });
  fs.createReadStream(filePath).pipe(response);
});

server.listen(port, () => {
  console.log(`Dashboard available at http://localhost:${port}`);
});
