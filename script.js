// script.js
let translateMode = 'off';
let targetLang = 'en';

const inputEl = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const langSelect = document.getElementById("language-select");

sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keypress", function (e) {
  if (e.key === "Enter") sendMessage();
});

if (langSelect) {
  langSelect.addEventListener("change", () => {
    targetLang = langSelect.value;
  });
}

function toggleTranslateMode() {
  if (translateMode === 'off') {
    translateMode = 'auto';
    alert("Auto Translate enabled. Messages will be translated to " + targetLang.toUpperCase());
  } else if (translateMode === 'auto') {
    translateMode = 'live';
    alert("Live Translate mode enabled. Original and translated text will both be shown.");
  } else {
    translateMode = 'off';
    alert("Translation disabled.");
  }
}

function sendMessage() {
  const message = inputEl.value.trim();
  if (!message) return;
  addMessage("You: " + message, "user-message");
  inputEl.value = "";

  if (translateMode === 'auto') {
    translateText(message, targetLang).then(translated => {
      callBotAPI(translated);
    });
  } else if (translateMode === 'live') {
    translateText(message, targetLang).then(translated => {
      addMessage(`Guest: ${message}\nStaff (${targetLang.toUpperCase()}): ${translated}`, "bot-message");
    });
  } else {
    callBotAPI(message);
  }
}

function addMessage(text, className) {
  const chat = document.getElementById("chat-container");
  const msg = document.createElement("div");
  msg.className = className;
  msg.textContent = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function callBotAPI(input) {
  fetch("https://advanced-ai-backend.onrender.com/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: input })
  })
    .then(res => res.json())
    .then(data => addMessage("Bot: " + data.reply, "bot-message"))
    .catch(err => {
      console.error(err);
      addMessage("Oops! The bot is currently unavailable.", "bot-message");
    });
}

async function translateText(text, target) {
  const res = await fetch('https://libretranslate.de/translate', {
    method: 'POST',
    body: JSON.stringify({
      q: text,
      source: 'auto',
      target: target,
      format: 'text'
    }),
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  return data.translatedText;
}

function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = targetLang || 'en-US';
  recognition.start();
  recognition.onresult = function(event) {
    inputEl.value = event.results[0][0].transcript;
  };
}

function readBotMessage() {
  const msg = new SpeechSynthesisUtterance();
  const lastBot = document.querySelectorAll(".bot-message");
  if (lastBot.length > 0) {
    msg.text = lastBot[lastBot.length - 1].innerText;
    window.speechSynthesis.speak(msg);
  }
}
