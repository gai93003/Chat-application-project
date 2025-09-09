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

const callbacksForNewMessages = [];

app.get("/messages", (req, res) => {
  const since = req.query.since ? Number(req.query.since) : null;

  if (since === null) {
    // No since param → send the full history
    return res.json(messages);
  }

  const messagesToSend = messages.filter(msg => msg.timestamp > since);

  if (messagesToSend.length === 0) {
    // No new messages yet → long-poll
    callbacksForNewMessages.push((newMsgs) => res.json(newMsgs));
  } else {
    // Send only new messages
    res.json(messagesToSend);
  }
});


// Add a new message with a timestamp
app.post('/messages', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).send("Message is required.");
  }
  const newMsg = { message, timestamp: Date.now() };
  messages.push(newMsg);

  // Wake up any waiting GET requests
  while (callbacksForNewMessages.length > 0) {
    const callback = callbacksForNewMessages.pop();
    callback([newMsg]); // always send an array
  }

  res.status(201).json(newMsg);
});

// Optionally, keep the old root GET for compatibility
app.get("/", (req, res) => {
  res.json(messages);
});

app.listen(port, () => {
  console.log(`Chat application server listening on port ${port}`);
});