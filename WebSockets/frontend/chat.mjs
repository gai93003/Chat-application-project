// const url = 'http://0.0.0.0:3000';
const url = 'https://x0cgw40ok0o4wgosoo0g4kow.hosting.codeyourfuture.io';
const messageContainer = document.getElementById('chat-body');
const inputEl = document.getElementById('input-el');
const submitBtn = document.getElementById('send-btn');
let messagesState = []; // Store all messages locally
let ws;
inputEl.value = '';

// ------------------ FETCH HISTORY ------------------ //
const getMessages = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${url}/messages`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const messages = await response.json();
    messagesState = messages;
    displayMessages(messagesState);
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
};

// ------------------ DISPLAY MESSAGES ------------------ //
const displayMessages = (messages) => {
  messageContainer.innerHTML = '';

  messages.forEach((message) => {
    const wrapper = document.createElement('div');
    wrapper.className = "message";

    // Add different class name depending on sender

    if ( message.username === window.currentUser ) {
      wrapper.classList.add("my-message");
    }
    else {
      wrapper.classList.add("other-message");
    }

    const para = document.createElement('p');
    para.innerHTML = `<strong>${message.username ?? 'Anonymous'}:</strong> ${message.message}`;

    // Like button
    const likeBtn = document.createElement('button');
    likeBtn.textContent = `👍 ${message.likes ?? 0}`;
    likeBtn.onclick = async () => {
      // Optimistic UI
      message.likes = (message.likes ?? 0) + 1;
      displayMessages(messagesState);

      await fetch(`${url}/messages/${message.id}/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ type: "like" })
      });
    };

    // Dislike button
    const dislikeBtn = document.createElement('button');
    dislikeBtn.textContent = `👎 ${message.dislikes ?? 0}`;
    dislikeBtn.onclick = async () => {
      message.dislikes = (message.dislikes ?? 0) + 1;
      displayMessages(messagesState);

      await fetch(`${url}/messages/${message.id}/reaction`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ type: "dislike" })
      });
    };

    wrapper.appendChild(para);
    wrapper.appendChild(likeBtn);
    wrapper.appendChild(dislikeBtn);
    messageContainer.appendChild(wrapper);
  });
};

// ------------------ SEND NEW MESSAGE ------------------ //
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
      headers: { "Content-Type": "application/json",
        "Authorization" : "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({ 
        message: newMessage,
      })
    });

    if (!response.ok) {
      alert("Failed to send the message");
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

submitBtn.addEventListener('click', storeMessages);

// ------------------ WEBSOCKET SETUP ------------------ //

const setupWebSocket = () => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${wsProtocol}://x0cgw40ok0o4wgosoo0g4kow.hosting.codeyourfuture.io?token=${localStorage.getItem("token")}`);

  ws.onopen = () => {
    console.log("WebSocket connected");
  };

  ws.onmessage = (event) => {
    const payload = JSON.parse(event.data);

    if (payload.type === "history") {
      messagesState = payload.data;
    } else if (payload.type === "message" || payload.type === "reaction") {
      const index = messagesState.findIndex(m => m.id === payload.data.id);
      if (index !== -1) {
        messagesState[index] = payload.data;
      } else {
        messagesState.push(payload.data);
      }
    }

    displayMessages(messagesState);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  ws.onclose = () => {
    console.log("WebSocket closed. Reconnecting in 2s...");
    setTimeout(setupWebSocket, 2000);
  };
};

// ------------------ INIT ------------------ //
window.onload = async () => {
  await getMessages(); // load old messages first
  setupWebSocket();    // then connect WebSocket
};


export { getMessages, setupWebSocket };