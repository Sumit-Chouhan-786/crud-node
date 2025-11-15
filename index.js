import http from "http";
import fs from "fs";

const PORT = 5000;
const FILE_PATH = "data.json";

// Read data.json file
function readData() {
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, "[]");
  }

  const raw = fs.readFileSync(FILE_PATH, "utf8").trim();

  if (raw === "" || raw === null) {
    fs.writeFileSync(FILE_PATH, "[]");
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    // Auto-fix corrupted JSON
    fs.writeFileSync(FILE_PATH, "[]");
    return [];
  }
}

// Write data.json file
function writeData(data) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

// Create HTTP Server
const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS preflight (required for POST/PUT)
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  // GET ALL TODOS -----------------------------------------
  if (req.url === "/todos" && req.method === "GET") {
    const todos = readData();
    return res.end(JSON.stringify(todos));
  }

  // CREATE TODO -------------------------------------------
  if (req.url === "/todos" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      const todos = readData();
      const data = JSON.parse(body);

      const newTodo = {
        id: Date.now(),
        title: data.title,
        description: data.description,
        purpose: data.purpose
      };

      todos.push(newTodo);
      writeData(todos);

      res.end(JSON.stringify({ message: "Todo Created Successfully", todo: newTodo }));
    });

    return;
  }

  // UPDATE TODO ------------------------------------------
  if (req.url.startsWith("/todos/") && req.method === "PUT") {
    const id = req.url.split("/")[2];
    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      const todos = readData();
      const updateData = JSON.parse(body);

      const index = todos.findIndex(t => t.id == id);

      if (index === -1) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ message: "Todo Not Found" }));
      }

      todos[index] = { ...todos[index], ...updateData };
      writeData(todos);

      res.end(JSON.stringify({ message: "Todo Updated", todo: todos[index] }));
    });

    return;
  }

  // DELETE TODO ------------------------------------------
  if (req.url.startsWith("/todos/") && req.method === "DELETE") {
    const id = req.url.split("/")[2];

    const todos = readData();
    const filtered = todos.filter(t => t.id != id);

    writeData(filtered);

    return res.end(JSON.stringify({ message: "Todo Deleted Successfully" }));
  }

  // INVALID ROUTE ----------------------------------------
  res.statusCode = 404;
  res.end(JSON.stringify({ message: "Route Not Found" }));
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
