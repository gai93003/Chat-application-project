const url = 'https://gai93003-chat-application.hosting.codeyourfuture.io';
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

  if (!newMessage) {
    alert("Please type a message");
    return;
  }

  try {
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


window.onload = getMessages;