const url = 'https://x0cgw40ok0o4wgosoo0g4kow.hosting.codeyourfuture.io';
const messageContainer = document.getElementById('chat-body');
const inputEl = document.getElementById('input-el');
const submitBtn = document.getElementById('send-btn');
let messagesState = []; // Store all messages locally

// Fetch old messages once (history)
const getMessages = async () => {
  try {
    const response = await fetch(`${url}/messages`);
    const messages = await response.json();
    messagesState = messages;
    displayMessages(messages);
  }
  catch (error) {
    console.error("Error", error);
    return [];
  }
};

const displayMessages = (messages) => {
  messageContainer.innerHTML = '';
  for (let message of messages) {
    const para = document.createElement('p');
    para.textContent = message.message;
    messageContainer.appendChild(para);
  }
};

const storeMessages = async (event) => {
  event.preventDefault();

  const newMessage = inputEl.value.trim();
  inputEl.value = '';

  if (!newMessage) {
    alert("Please type a message");
    return;
  }

  try {
    const response = await fetch(`${url}/messages`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ message: newMessage }), 
    });

    if (!response.ok) {
      alert("Failed to send the message");
    }
  }
  catch (error) {
    console.log("Error sending message:", error);
  }
};

submitBtn.addEventListener('click', storeMessages);

// WebSocket setup
let ws;

const setupWebSocket = () => {
  // Use wss:// instead of http(s)://
  ws = new WebSocket("wss://x0cgw40ok0o4wgosoo0g4kow.hosting.codeyourfuture.io");

  ws.onopen = () => {
    console.log("WebSocket connected");
  };

  ws.onmessage = (event) => {
    const newMessage = JSON.parse(event.data);
    messagesState.push(newMessage);
    displayMessages(messagesState);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  ws.onclose = () => {
    console.log("WebSocket closed. Reconnecting in 2s...");
    setTimeout(setupWebSocket, 2000); // auto-reconnect
  };
};

window.onload = async () => {
  await getMessages();   // Load old messages first
  setupWebSocket();      // Then connect WebSocket
};
