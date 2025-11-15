import http from "http";
import fs from "fs";

const PORT = 5000;
const FILE = "data.json";

// Read Data
function read() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]");
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

// Write Data
function write(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// Server
const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.end();

  // GET ALL TODOS
  if (req.url === "/todos" && req.method === "GET") {
    return res.end(JSON.stringify(read()));
  }

  // CREATE TODO
  if (req.url === "/todos" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);

    req.on("end", () => {
      const todos = read();
      const data = JSON.parse(body);

      const newTodo = { id: Date.now(), ...data };
      todos.push(newTodo);
      write(todos);

      res.end(JSON.stringify({ message: "Todo Created", todo: newTodo }));
    });
    return;
  }

  // UPDATE TODO
  if (req.url.startsWith("/todos/") && req.method === "PUT") {
    const id = req.url.split("/")[2];
    let body = "";
    req.on("data", chunk => body += chunk);

    req.on("end", () => {
      const todos = read();
      const index = todos.findIndex(t => t.id == id);
      if (index === -1) return res.end(JSON.stringify({ message: "Not Found" }));

      const update = JSON.parse(body);
      todos[index] = { ...todos[index], ...update };
      write(todos);

      res.end(JSON.stringify({ message: "Todo Updated", todo: todos[index] }));
    });
    return;
  }

  // DELETE TODO
  if (req.url.startsWith("/todos/") && req.method === "DELETE") {
    const id = req.url.split("/")[2];
    const todos = read();
    write(todos.filter(t => t.id != id));

    return res.end(JSON.stringify({ message: "Todo Deleted" }));
  }

  // 404
  res.end(JSON.stringify({ message: "Route Not Found" }));
});

// Start Server
server.listen(PORT, () => console.log(`Server running → http://localhost:${PORT}`));
