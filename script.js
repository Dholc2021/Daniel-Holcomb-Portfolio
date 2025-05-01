// script.js

document.addEventListener('DOMContentLoaded', () => {
  // State
  let translateMode = 'off';
  let targetLang    = 'en';

  // Elements
  const widget      = document.getElementById('bot-widget');
  const bubbleToggle= document.getElementById('bubble-toggle');
  const inputEl     = document.getElementById('user-input');
  const sendBtn     = document.getElementById('send-btn');
  const chat        = document.getElementById('chat-container');
  const langSelect  = document.getElementById('language-select');
  const toggleBtn   = document.getElementById('toggle-translate-btn');
  const speakBtn    = document.querySelector('.voice-controls button[onclick="startListening()"]');
  const readBtn     = document.querySelector('.voice-controls button[onclick="readBotMessage()"]');

  // INITIALIZE
  widget.style.display = 'none';

  // 1) Widget show/hide
  bubbleToggle.addEventListener('click', () => {
    widget.style.display = widget.style.display === 'none' ? 'block' : 'none';
  });

  // 2) Language picker
  if (langSelect) {
    langSelect.addEventListener('change', () => {
      targetLang = langSelect.value;
      console.log('Target language:', targetLang);
    });
  }

  // 3) Translation toggle
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (translateMode === 'off') {
        translateMode = 'auto';
        alert(`Auto Translate enabled. Messages will be translated to ${targetLang.toUpperCase()}`);
      } else if (translateMode === 'auto') {
        translateMode = 'live';
        alert('Live Translate enabled. You’ll see both original and translated text.');
      } else {
        translateMode = 'off';
        alert('Translation disabled.');
      }
      console.log('translateMode =', translateMode);
    });
  }

  // 4) Send message
  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
  });

  // 5) Voice controls
  if (speakBtn) {
    speakBtn.addEventListener('click', startListening);
  }
  if (readBtn) {
    readBtn.addEventListener('click', readBotMessage);
  }

  // ——— CORE FUNCTIONS ———

  // ——— REPLACE YOUR EXISTING sendMessage(...) WITH THIS ———
async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  console.log("🔸 sendMessage()", { text, translateMode, targetLang });
  addMessage(`You: ${text}`, 'user-message');
  inputEl.value = '';

  if (translateMode === 'auto') {
    const t = await translateText(text, targetLang);
    console.log("   ↳ translated to EN:", t);
    callBotAPI(t);
  }
  else if (translateMode === 'live') {
    const t = await translateText(text, targetLang);
    addMessage(
      `Guest: ${text}\nStaff (${targetLang.toUpperCase()}): ${t}`,
      'bot-message'
    );
  }
  else {
    callBotAPI(text);
  }
}

// ——— REPLACE YOUR EXISTING callBotAPI(...) WITH THIS ———
function callBotAPI(msg) {
  console.log("🔸 callBotAPI()", msg);
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

  function startListening() {
    const recog = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recog.lang = targetLang === 'en' ? 'en-US' : targetLang;
    recog.start();
    recog.onresult = e => {
      inputEl.value = e.results[0][0].transcript;
    };
  }

  function readBotMessage() {
    const msgs = document.querySelectorAll('.bot-message');
    if (!msgs.length) return;
    const last = msgs[msgs.length - 1].innerText;
    const utter = new SpeechSynthesisUtterance(last);
    window.speechSynthesis.speak(utter);
  }
});
