import express from "express";
import cors from "cors";
import http from "http";
import { server as WebSocketServer } from "websocket";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ------------------ STORAGE ------------------ //
const messages = [
  { 
    id: Date.now(), 
    message: "Hello buddy, how did your day go?", 
    timestamp: Date.now(),
    likes: 0,
    dislikes: 0
  },
  { 
    id: Date.now() + 1, 
    message: "Hey man, my day went well thanks and yours?", 
    timestamp: Date.now(),
    likes: 0,
    dislikes: 0
  }
];

// ------------------ ROUTES ------------------ //

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "✅ Chat backend is running" });
});

// Get all messages
app.get("/messages", (req, res) => {
  res.json(messages);
});

// Add a new message
app.post("/messages", (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const newMsg = { 
    id: Date.now(), 
    message, 
    timestamp: Date.now(), 
    likes: 0, 
    dislikes: 0 
  };
  messages.push(newMsg);

  broadcast(JSON.stringify({ type: "message", data: newMsg }));
  res.status(201).json(newMsg);
});

// Like or dislike a message
app.post("/messages/:id/reaction", (req, res) => {
  const { id } = req.params;
  const { type } = req.body; // "like" or "dislike"

  const message = messages.find(m => m.id == id);
  if (!message) {
    return res.status(404).json({ error: "Message not found" });
  }

  if (type === "like") {
    message.likes += 1;
  } else if (type === "dislike") {
    message.dislikes += 1;
  } else {
    return res.status(400).json({ error: "Invalid reaction type" });
  }

  broadcast(JSON.stringify({ type: "reaction", data: message }));
  res.json(message);
});

// ------------------ SERVER & WEBSOCKETS ------------------ //

const server = http.createServer(app);
server.listen(port, "0.0.0.0", () => {
  console.log(`Chat app running at http://0.0.0.0:${port}`);
});

const clients = new Set();

const webSocketServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

function originIsAllowed(origin) {
  return true; // add restrictions later if needed
}

webSocketServer.on("request", (request) => {
  if (!originIsAllowed(request.origin)) {
    request.reject();
    console.log("Connection rejected:", request.origin);
    return;
  }

  const connection = request.accept(null, request.origin);
  clients.add(connection);
  console.log("✅ New WebSocket connection");

  // Send full chat history on first connect
  connection.sendUTF(JSON.stringify({ type: "history", data: messages }));

  // Listen for new messages via WebSocket
  connection.on("message", (message) => {
    if (message.type === "utf8") {
      const newMsg = { 
        id: Date.now(), 
        message: message.utf8Data, 
        timestamp: Date.now(), 
        likes: 0, 
        dislikes: 0 
      };
      messages.push(newMsg);

      broadcast(JSON.stringify({ type: "message", data: newMsg }));
    }
  });

  connection.on("close", () => {
    clients.delete(connection);
    console.log("❌ WebSocket connection closed");
  });
});

function broadcast(data) {
  for (const client of clients) {
    client.sendUTF(data);
  }
}
