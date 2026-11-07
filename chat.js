// Website chat assistant: a floating button that opens a small chat panel.
// Messages are sent to /api/chat, which asks Claude and returns a reply.
(function () {
  // Only show the chat button when the server says the assistant is set up.
  fetch("/api/chat")
    .then(function (r) { return r.ok ? r.json() : {}; })
    .then(function (d) { if (d && d.ready) start(); })
    .catch(function () {});

  function start() {
  var WHATSAPP = "https://wa.me/60169088969?text=Hi%2C%20I%20would%20like%20to%20book%20a%20meeting.";
  var history = [];
  var busy = false;

  var root = document.createElement("div");
  root.className = "chat";
  root.innerHTML =
    '<button class="chat-toggle" type="button" aria-expanded="false" aria-controls="chat-panel">' +
      '<span class="chat-toggle-open">Ask us anything</span><span class="chat-toggle-close" aria-hidden="true">&times;</span>' +
    "</button>" +
    '<section class="chat-panel" id="chat-panel" hidden aria-label="Chat with Education Plus AI">' +
      '<header class="chat-head"><strong>Education Plus AI</strong><span>Ask about our services and packages</span></header>' +
      '<div class="chat-log" aria-live="polite"></div>' +
      '<form class="chat-form">' +
        '<label class="sr-only" for="chat-input">Your question</label>' +
        '<input id="chat-input" type="text" maxlength="1500" autocomplete="off" placeholder="Type your question..." required>' +
        '<button class="btn btn-small" type="submit">Send</button>' +
      "</form>" +
      '<p class="chat-note">AI assistant. For bookings, <a href="' + WHATSAPP + '" target="_blank" rel="noopener">message us on WhatsApp</a>.</p>' +
    "</section>";
  document.body.appendChild(root);

  var toggle = root.querySelector(".chat-toggle");
  var panel = root.querySelector(".chat-panel");
  var log = root.querySelector(".chat-log");
  var form = root.querySelector(".chat-form");
  var input = root.querySelector("#chat-input");
  var sendBtn = form.querySelector("button");

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Safe, tiny formatter: escapes everything, then allows **bold**, https links and line breaks.
  function format(text) {
    var html = escapeHtml(text);
    html = html.replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    return html.replace(/\n/g, "<br>");
  }

  function addBubble(role, text) {
    var div = document.createElement("div");
    div.className = "chat-msg chat-" + role;
    div.innerHTML = format(text);
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  function setOpen(open) {
    panel.hidden = !open;
    root.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (open) {
      if (!log.children.length) {
        addBubble("assistant", "Hi! I can answer questions about Education Plus AI, our services and the Build an AI-Powered School packages. What would you like to know?");
      }
      input.focus();
    }
  }

  toggle.addEventListener("click", function () { setOpen(panel.hidden); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) setOpen(false); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text || busy) return;
    input.value = "";
    addBubble("user", text);
    history.push({ role: "user", content: text });

    busy = true;
    sendBtn.disabled = true;
    var thinking = addBubble("assistant", "...");
    thinking.classList.add("chat-typing");

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (data) {
        thinking.remove();
        if (data && data.reply) {
          addBubble("assistant", data.reply);
          history.push({ role: "assistant", content: data.reply });
        } else {
          history.pop(); // let the visitor try the same question again
          addBubble("assistant", ((data && data.error) || "Sorry, something went wrong.") + " You can also [message us on WhatsApp](" + WHATSAPP + ").");
        }
      })
      .catch(function () {
        thinking.remove();
        history.pop();
        addBubble("assistant", "Sorry, I couldn't connect. Please try again, or [message us on WhatsApp](" + WHATSAPP + ").");
      })
      .then(function () {
        busy = false;
        sendBtn.disabled = false;
        input.focus();
      });
  });
  }
})();
