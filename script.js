// --- 100% BULLETPROOF CLOUDFLARE URL ---
const BASE_WEBHOOK_URL = "https://ships-generators-relative-wma.trycloudflare.com/webhook/party-rental-chat";

let isSending = false; 

function toggleBackend() { 
    document.getElementById('backendPanel').classList.toggle('open'); 
}

function toggleChat() {
    const chat = document.getElementById('chatContainer');
    const toggleBtn = document.getElementById('chatToggleBtn');
    chat.classList.toggle('open');
    toggleBtn.classList.toggle('hidden');
    if (chat.classList.contains('open')) {
        document.getElementById('user-input').focus();
    }
}

// Only auto-open chat if screen is larger than a phone
setTimeout(() => {
    if (window.innerWidth > 768) {
        const chat = document.getElementById('chatContainer');
        const toggleBtn = document.getElementById('chatToggleBtn');
        if (!chat.classList.contains('open')) {
            chat.classList.add('open');
            toggleBtn.classList.add('hidden');
        }
    }
}, 2000);

function openChatWithPrefill(text) {
    const chat = document.getElementById('chatContainer');
    const toggleBtn = document.getElementById('chatToggleBtn');
    chat.classList.add('open');
    toggleBtn.classList.add('hidden');
    const input = document.getElementById('user-input');
    input.value = text;
    
    input.style.height = "auto";
    input.style.height = (input.scrollHeight) + "px";
    
    input.focus();
}

// Auto-expanding textarea logic
const userInput = document.getElementById("user-input");
userInput.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
});

const sessionId = "session_" + Math.floor(Math.random() * 1000000000);
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");
const typingIndicator = document.getElementById("typing-indicator");

function appendMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `msg ${sender}`;
    
    // Transform Stripe links into a sleek popup window
    if(text.includes('stripe.com')) {
        text = text.replace(/(https:\/\/(buy|book)\.stripe\.com\/[^\s]+)/g, '<a href="#" onclick="window.open(\'$1\', \'StripeCheckout\', \'width=450,height=750,top=100,left=100,resizable=yes,scrollbars=yes\'); return false;" style="color:var(--primary); font-weight:bold; text-decoration:underline; cursor:pointer;">Click Here to Pay via Stripe &rarr;</a>');
    }
    
    msgDiv.innerHTML = text; 
    chatBox.insertBefore(msgDiv, typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() { 
    typingIndicator.style.display = "flex"; 
    chatBox.scrollTop = chatBox.scrollHeight; 
}

function hideTyping() { 
    typingIndicator.style.display = "none"; 
}

async function sendMessage() {
    if (isSending) return;

    const text = userInput.value.trim();
    if (!text) return;

    isSending = true;

    appendMessage(text, "user");
    userInput.value = "";
    userInput.style.height = "auto";
    userInput.disabled = true;
    sendBtn.disabled = true;

    showTyping();

    try {
        const liveUrl = BASE_WEBHOOK_URL + "?t=" + Date.now();
        
        const response = await fetch(liveUrl, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ sessionId: sessionId, message: text })
        });

        const data = await response.json();
        hideTyping();
        appendMessage(data.text || "Sorry, I encountered an error.", "bot");

        // If AI deployed the Stripe link, show the green alert in the Dev Panel
        if(data.ready_to_pay === true || data.ready_to_pay === "true") {
            document.getElementById("stripeAlert").style.display = "block";
            const panel = document.getElementById("backendPanel");
            if (!panel.classList.contains("open")) {
                panel.classList.add("open");
            }
        }

    } catch (error) {
        hideTyping();
        console.error("Transmission Error:", error);
        appendMessage("Network error or outdated browser detected. Please check your connection or call us directly.", "bot");
        
        const errorTrace = `[DIAGNOSTIC TRACE]<br>Error: ${error.name}<br>Message: ${error.message}<br>Check n8n CORS settings or Cloudflare connection!`;
        appendMessage(`<div style="font-size: 11px; color: #e11d48; margin-top: 8px; border-top: 1px solid rgba(225,29,72,0.2); padding-top: 8px; font-family: monospace; line-height: 1.3;">${errorTrace}</div>`, "bot");
    } finally {
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
        
        isSending = false; 
    }
}

function handleKeyPress(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}