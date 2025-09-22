import express from "express";
import cors from "cors";
import http from "http";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { server as WebSocketServer } from "websocket";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ------------------ USERS STORAGE ------------------ //
const usersFile = path.join(process.cwd(), "users.json");

function loadUsers() {
  if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, "{}");

  const data = fs.readFileSync(usersFile, "utf-8").trim();

  // if a file is empty, it should return an empty object to avoid errors
  if (!data) return {};

  return JSON.parse(data);
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

function getUser(username) {
  const users = loadUsers();
  return users[username];
}

function addUser(username, passwordHash) {
  const users = loadUsers();
  users[username] = { passwordHash };
  saveUsers(users);
}

// ------------------ AUTH ROUTES ------------------ //
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });

  if (getUser(username)) return res.status(400).json({ message: "User already exists" });

  const hash = await bcrypt.hash(password, 10);
  addUser(username, hash);

  res.status(201).json({ message: "✅ User registered successfully" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = getUser(username);

  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  res.json({ message: "✅ Login successful" });
});

// ------------------ CHAT STORAGE ------------------ //
const messages = [
  { id: Date.now(), message: "Hello buddy, how did your day go?", timestamp: Date.now(), likes: 0, dislikes: 0 },
  { id: Date.now() + 1, message: "Hey man, my day went well thanks and yours?", timestamp: Date.now(), likes: 0, dislikes: 0 }
];

// ------------------ CHAT ROUTES ------------------ //
app.get("/", (req, res) => res.json({ status: "ok", message: "✅ Chat backend is running" }));
app.get("/messages", (req, res) => res.json(messages));

// app.post("/messages", (req, res) => {
//   const { message } = req.body;
//   if (!message) return res.status(400).json({ error: "Message is required" });

//   const newMsg = { id: Date.now(), message, username, timestamp: Date.now(), likes: 0, dislikes: 0 };
//   messages.push(newMsg);

//   broadcast(JSON.stringify({ type: "message", data: newMsg }));
//   res.status(201).json(newMsg);
// });

app.post("/messages", (req, res) => {
  const { message, username } = req.body; // ✅ extract username

  if (!message || !username) {
    return res.status(400).json({ error: "Message and username required" });
  }

  const newMsg = { 
    id: Date.now(), 
    message, 
    username,       // ✅ now this exists
    timestamp: Date.now(), 
    likes: 0, 
    dislikes: 0 
  };
  messages.push(newMsg);

  broadcast(JSON.stringify({ type: "message", data: newMsg }));
  res.status(201).json(newMsg);
});


app.post("/messages/:id/reaction", (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  const message = messages.find(m => m.id == id);
  if (!message) return res.status(404).json({ error: "Message not found" });

  if (type === "like") message.likes += 1;
  else if (type === "dislike") message.dislikes += 1;
  else return res.status(400).json({ error: "Invalid reaction type" });

  broadcast(JSON.stringify({ type: "reaction", data: message }));
  res.json(message);
});

// ------------------ WEBSOCKET SERVER ------------------ //
const server = http.createServer(app);
server.listen(port, "0.0.0.0", () => console.log(`Chat app running at http://0.0.0.0:${port}`));

const clients = new Set();
const webSocketServer = new WebSocketServer({ httpServer: server, autoAcceptConnections: false });

function originIsAllowed(origin) { return true; }

webSocketServer.on("request", request => {
  if (!originIsAllowed(request.origin)) { request.reject(); return; }
  const connection = request.accept(null, request.origin);
  clients.add(connection);
  connection.sendUTF(JSON.stringify({ type: "history", data: messages }));

  connection.on("message", message => {
    if (message.type === "utf8") {
      const newMsg = { id: Date.now(), message: message.utf8Data, timestamp: Date.now(), likes: 0, dislikes: 0 };
      messages.push(newMsg);
      broadcast(JSON.stringify({ type: "message", data: newMsg }));
    }
  });

  connection.on("close", () => clients.delete(connection));
});

function broadcast(data) {
  for (const client of clients) client.sendUTF(data);
}
