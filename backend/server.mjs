import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());

const messages = [
  {
    message: "Hello buddy, how did your day go?"
  },
  {
    message: "Hey man, my day went well thanks and yours?"
  }
];

// Use express.json() middleware to parse JSON bodies

app.use(express.json());

app.get("/", (req, res) => {
  console.log("Received a request for a quote");

  if (messages.length === 0) {
    return res.status(404).json({ error: "No messages available." });
  }

  res.json(messages);
});

app.post('/', (req, res) => {
  const { message } = req.body;

  if(!message) {
    return res.status(400).send("Message is required.");
  }

  messages.push({ message });
  res.send("ok");
});


app.listen(port, () => {
  console.log(`Chat application server listening on port ${port}`);
});

