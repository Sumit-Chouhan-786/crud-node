const http = require("http");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");

// File path
const file = path.join(__dirname, "demo.json");

// Safe read
function read() {
  try {
    if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
    const content = fs.readFileSync(file, "utf8").trim();
    return content ? JSON.parse(content) : [];
  } catch {
    fs.writeFileSync(file, "[]");
    return [];
  }
}

// Safe write
function write(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Server
const server = http.createServer((req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // GET /todos
  if (req.url.startsWith("/todos") && req.method === "GET") {
    const data = read();
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(data));
  }

  // POST /todos  (NO REDIRECT)
  if (req.url === "/todos" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => body += chunk);

    req.on("end", () => {
      let parsed;

      // JSON or Form
      try {
        parsed = JSON.parse(body);
      } catch {
        parsed = querystring.parse(body);
      }

      const item = {
        id: Date.now().toString(),
        title: parsed.title || "",
        description: parsed.description || "",
        purpose: parsed.purpose || ""
      };

      const data = read();
      data.push(item);
      write(data);

      // Return JSON, no redirect
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", item }));
    });

    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

// Start server
server.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
