const url = 'https://gai3003-chat-application-server-backend.hosting.codeyourfuture.io';
const messageContainer = document.getElementById('chat-body');
const inputEl = document.getElementById('input-el');
const submitBtn = document.getElementById('send-btn');

const getMessages = async () => {
  try {
    const response = await fetch(url);
    const messages = await response.json();

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

const storeMessages = async (event) => {
  event.preventDefault();

  const newMessage = inputEl.value.trim();
    inputEl.value = '';

  if (!newMessage) {
    alert("Please type a message");
    return;
  }

  try {
    // inputEl.value = '';
    const response = await fetch(url, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ message: newMessage }), 
    });

    if (response.ok) {
      // alert("Message successfully sent, Yahhh!");
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
    const lastMessageTime = state.messages.length > 0 ? state.messages[state.messages.length - 1].timestamp : null;
    const queryString = lastMessageTime ? `?since=${lastMessageTime}` : "";
    const url = `${server}/messages${queryString}`;
    const rawResponse = await fetch(url);
    const response = await rawResponse.json();
    state.messages.push(...response);
    displayMessages(state.messages);
    setTimeout(keepFetchingMessages, 100);
}


window.onload = getMessages;