const url = 'https://gai3003-chat-application-server-backend.hosting.codeyourfuture.io'
const messageContainer = document.getElementById('chat-body');
const inputEl = document.getElementById('input-el');
const submitBtn = document.getElementById('send-btn');
let messagesState = []; // Store all messages locally

const getMessages = async () => {
  try {
    const response = await fetch(`${url}/messages`);
    const messages = await response.json();
    messagesState = messages; // Store messages for polling
    displayMessages(messages)
  }
  catch (error) {
    console.error("Error", error);
    return [];
  }
}

const displayMessages = (messages) => {

  messageContainer.innerHTML = '';
  for (let message of messages) {
    const para = document.createElement('p');
    para.textContent = message.message;

    messageContainer.appendChild(para)
  }
}

// const storeMessages = async (event) => {
//   event.preventDefault();

//   const newMessage = inputEl.value.trim();
//     inputEl.value = '';

//   if (!newMessage) {
//     alert("Please type a message");
//     return;
//   }

//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       headers: {"Content-Type": "application/json"},
//       body: JSON.stringify({ message: newMessage }), 
//     });

//     if (response.ok) {
//       // alert("Message successfully sent, Yahhh!");
//       getMessages();
//     }
//     else {
//       alert("Failed to send the message");
//     }
//   }
//   catch (error) {
//     console.log("Error sending message:", error);
//   }
// };

const storeMessages = async (event) => {
  event.preventDefault();

  const newMessage = inputEl.value.trim();
  inputEl.value = '';

  if (!newMessage) {
    alert("Please type a message");
    return;
  }

  try {
    // FIX: Correct POST URL
    const response = await fetch(`${url}/messages`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ message: newMessage }), 
    });

    if (response.ok) {
      getMessages();
    }
    else {
      alert("Failed to send the message");
    }
  }
  catch (error) {
    console.log("Error sending message:", error);
  }
};

submitBtn.addEventListener('click', storeMessages);

const keepFetchingMessages = async () => {
  try {
    const lastMessageTime = messagesState.length > 0 ? messagesState[messagesState.length - 1].timestamp : null;
    let fetchUrl = `${url}/messages`;
    if (lastMessageTime) {
      fetchUrl += `?since=${lastMessageTime}`;
    }
    const response = await fetch(fetchUrl);
    const newMessages = await response.json();

    if (newMessages.length > 0) {
      messagesState.push(...newMessages);
      displayMessages(messagesState);
    }
  } catch (error) {
    console.error("Polling error:", error);
  }
  setTimeout(keepFetchingMessages, 1000); // Poll every second
};


window.onload = async () => {
  await getMessages();
  keepFetchingMessages()
}