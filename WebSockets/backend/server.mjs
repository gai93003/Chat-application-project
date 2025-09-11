import express from "express";
import cors from "cors";
import http from "http";
import { server as WebSocketServer } from "websocket";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app); // HTTP server
server.listen(port, () => {
  console.log(`Chat app running on http://localhost:${port}`);
});

const messages = [
  { message: "Hello buddy, how did your day go?", timestamp: Date.now() },
  { message: "Hey man, my day went well thanks and yours?", timestamp: Date.now() }
];

const clients = new Set();

const webSocketServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

function originIsAllowed(origin) {
  return true; // you can add restrictions here later
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

  // Send chat history
  connection.sendUTF(JSON.stringify(messages));

  // Listen for new messages
  connection.on("message", (message) => {
    if (message.type === "utf8") {
      const newMsg = { message: message.utf8Data, timestamp: Date.now() };
      messages.push(newMsg);

      // Broadcast to everyone
      broadcast(JSON.stringify(newMsg));
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
