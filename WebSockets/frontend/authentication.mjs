import { getMessages, setupWebSocket } from "./chat.mjs"; // if exported

const url = 'https://x0cgw40ok0o4wgosoo0g4kow.hosting.codeyourfuture.io';

// const url = 'http://0.0.0.0:3000';

const statusEl = document.getElementById("status");

function showChat() {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("chat-section").style.display = "block";
}

async function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${url}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    statusEl.textContent = data.message;
  } catch (err) {
    statusEl.textContent = "Registration failed";
  }
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${url}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    statusEl.textContent = data.message;

    if (res.ok) {
      localStorage.setItem("token", data.token); // Save token
      window.currentUser = username; // store username globally
      showChat();

      // initialize chat after login
      await getMessages();
      setupWebSocket();


      console.log("Received token:", data.token);
      console.log("Saved token in localStorage:", localStorage.getItem("token"));
    }
    else {
      statusEl.textContent = data.message;
    }
  } catch (err) {
    statusEl.textContent = "Login failed";
    console.error(err);
  }
}

// Event listeners
document.getElementById("register-btn").addEventListener("click", register);
document.getElementById("login-btn").addEventListener("click", login);
