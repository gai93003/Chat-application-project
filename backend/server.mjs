import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const messages = [
  {
    message: "Hello buddy, how did your day go?",
    timestamp: Date.now()
  },
  {
    message: "Hey man, my day went well thanks and yours?",
    timestamp: Date.now()
  }
];

// Get all messages or only messages after a certain timestamp
app.get("/messages", (req, res) => {
  const since = Number(req.query.since);
  if (since) {
    const filtered = messages.filter(msg => msg.timestamp > since);
    return res.json(filtered);
  }
  res.json(messages);
});

// Add a new message with a timestamp
app.post('/messages', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).send("Message is required.");
  }
  const newMsg = { message, timestamp: Date.now() };
  messages.push(newMsg);
  res.status(201).json(newMsg);
});

// Optionally, keep the old root GET for compatibility
app.get("/", (req, res) => {
  res.json(messages);
});

app.listen(port, () => {
  console.log(`Chat application server listening on port ${port}`);
});