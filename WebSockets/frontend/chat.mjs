const url = 'http://0.0.0.0:3000';
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

// ✅ CHANGED: now render like/dislike buttons with counts
const displayMessages = (messages) => {
  messageContainer.innerHTML = '';
  for (let message of messages) {
    const wrapper = document.createElement('div');
    wrapper.className = "message"; // optional for styling
    wrapper.textContent = message.message;

    // Like button
    const likeBtn = document.createElement('button');
    likeBtn.textContent = `👍 ${message.likes ?? 0}`;
    likeBtn.onclick = async () => {
      await fetch(`${url}/messages/${message.id}/like`, { method: "POST" });
    };

    // Dislike button
    const dislikeBtn = document.createElement('button');
    dislikeBtn.textContent = `👎 ${message.dislikes ?? 0}`;
    dislikeBtn.onclick = async () => {
      await fetch(`${url}/messages/${message.id}/dislike`, { method: "POST" });
    };

    wrapper.appendChild(likeBtn);
    wrapper.appendChild(dislikeBtn);
    messageContainer.appendChild(wrapper);
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
    // ❌ REMOVED: no need to call getMessages()
    // WebSocket will update everyone automatically
  }
  catch (error) {
    console.log("Error sending message:", error);
  }
};

submitBtn.addEventListener('click', storeMessages);

// WebSocket setup
let ws;

const setupWebSocket = () => {
  ws = new WebSocket("wss://x0cgw40ok0o4wgosoo0g4kow.hosting.codeyourfuture.io");

  ws.onopen = () => {
    console.log("WebSocket connected");
  };

  // ✅ CHANGED: update message by id instead of always pushing
  ws.onmessage = (event) => {
    const updatedMessage = JSON.parse(event.data);

    // Find message in state
    const index = messagesState.findIndex(m => m.id === updatedMessage.id);
    if (index !== -1) {
      // Replace with updated version
      messagesState[index] = updatedMessage;
    } else {
      // New message (first time it appears)
      messagesState.push(updatedMessage);
    }

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
