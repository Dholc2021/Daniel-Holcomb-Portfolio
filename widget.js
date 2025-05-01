// 1) Prove the file loaded
console.log("⚙️ widget.js loaded");
// …


// 2) Wait for the DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("📅 DOMContentLoaded fired");

  // — State —
  let translateMode = 'off';
  let targetLang    = 'en';

  // — Element references —
  const inputEl    = document.getElementById('user-input');
  const sendBtn    = document.getElementById('send-btn');
  const langSelect = document.getElementById('language-select');
  const toggleBtn  = document.getElementById('toggle-translate-btn');

  // 3) Debug log what we found
  console.log("🔍 Elements:",
    "inputEl=",    inputEl,
    "sendBtn=",    sendBtn,
    "langSelect=", langSelect,
    "toggleBtn=",  toggleBtn
  );

  // — Event listeners —

  // Send message on button click
  sendBtn.addEventListener("click", sendMessage);

  // Send message on Enter
  inputEl.addEventListener("keypress", e => {
    if (e.key === 'Enter') sendMessage();
  });

  // Update targetLang when dropdown changes
  langSelect.addEventListener("change", () => {
    targetLang = langSelect.value;
    console.log("🗣️ Target language set to", targetLang);
  });

  // Toggle translate mode
  toggleBtn.addEventListener("click", toggleTranslateMode);

  // — Functions —

  function toggleTranslateMode() {
    if (translateMode === 'off') {
      translateMode = 'auto';
      alert(`Auto Translate enabled. Messages will be translated to ${targetLang.toUpperCase()}`);
    } else if (translateMode === 'auto') {
      translateMode = 'live';
      alert('Live Translate mode enabled. Original and translated text will both be shown.');
    } else {
      translateMode = 'off';
      alert('Translation disabled.');
    }
    console.log("🔁 translateMode =", translateMode);
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    console.log("✉️ sendMessage()", { text, translateMode, targetLang });
    addMessage(`You: ${text}`, 'user-message');
    inputEl.value = '';

    if (translateMode === 'auto') {
      const t = await translateText(text, targetLang);
      console.log("   ↳ translated to EN:", t);
      callBotAPI(t);
    }
    else if (translateMode === 'live') {
      const t = await translateText(text, targetLang);
      addMessage(`Guest: ${text}\nStaff (${targetLang.toUpperCase()}): ${t}`, 'bot-message');
    }
    else {
      callBotAPI(text);
    }
  }

  function addMessage(txt, cls) {
    const chat = document.getElementById('chat-container');
    const msg  = document.createElement('div');
    msg.className   = cls;
    msg.textContent = txt;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  }

  function callBotAPI(msg) {
    console.log("🤖 callBotAPI()", msg);
    fetch("https://advanced-ai-backend.onrender.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    })
      .then(res => {
        console.log("   ↳ status:", res.status);
        return res.json();
      })
      .then(data => {
        console.log("   ↳ reply:", data.reply);
        addMessage("Bot: " + data.reply, "bot-message");
      })
      .catch(err => {
        console.error("   ↳ fetch error", err);
        addMessage("Oops! The bot is currently unavailable.", "bot-message");
      });
  }

  async function translateText(text, target) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: 'auto', target: target, format: 'text' })
    });
    const { translatedText } = await res.json();
    return translatedText;
  }

  function startListening() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = targetLang === 'en' ? 'en-US' : targetLang;
    recognition.start();
    recognition.onresult = event => {
      inputEl.value = event.results[0][0].transcript;
    };
  }

  function readBotMessage() {
    const bots = document.querySelectorAll('.bot-message');
    if (!bots.length) return;
    const last = bots[bots.length - 1].innerText;
    const utter = new SpeechSynthesisUtterance(last);
    window.speechSynthesis.speak(utter);
  }
});
