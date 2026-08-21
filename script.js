// --- 100% BULLETPROOF CLOUDFLARE URL ---
const N8N_WEBHOOK_URL = 'https://matched-hierarchy-zealand-dui.trycloudflare.com/webhook/party-rental-chat';

let isSending = false; 

// --- EMAIL PING LOGIC ---
function checkEmailInput() {
    const emailInput = document.getElementById("demo-alert-dest");
    const pingNav = document.getElementById("dev-ping");
    const pingInput = document.getElementById("input-ping");
    
    if(emailInput && emailInput.value.trim() !== "") {
        if(pingNav) pingNav.style.display = "none";
        if(pingInput) pingInput.style.display = "none";
        emailInput.classList.add("filled");
    } else if(emailInput) {
        if(pingNav) pingNav.style.display = "inline-block";
        if(pingInput) pingInput.style.display = "inline-block";
        emailInput.classList.remove("filled");
    }
}

function toggleBackend() { 
    const panel = document.getElementById('backendPanel');
    if(panel) panel.classList.toggle('open'); 
    
    // Auto-focus the email box when they open it, if it's empty
    const emailInput = document.getElementById("demo-alert-dest");
    if(emailInput && emailInput.value.trim() === "") {
        setTimeout(() => emailInput.focus(), 400);
    }
}

function refreshFrame(id) {
    const frame = document.getElementById(id);
    const btn = document.getElementById('btn-' + id);
    
    if(btn) {
        btn.classList.add('spinning');
        setTimeout(() => btn.classList.remove('spinning'), 600);
    }
    
    if(frame) {
        const currentSrc = frame.src;
        frame.src = '';
        setTimeout(() => { frame.src = currentSrc; }, 100);
    }
}

function toggleChat() {
    const chat = document.getElementById('chatContainer');
    const toggleBtn = document.getElementById('chatToggleBtn');
    if(chat) chat.classList.toggle('open');
    if(toggleBtn) toggleBtn.classList.toggle('hidden');
    if (chat && chat.classList.contains('open')) {
        const userInput = document.getElementById('user-input');
        if(userInput) userInput.focus();
    }
}

// Only auto-open chat if screen is larger than a phone
setTimeout(() => {
    if (window.innerWidth > 768) {
        const chat = document.getElementById('chatContainer');
        const toggleBtn = document.getElementById('chatToggleBtn');
        if (chat && !chat.classList.contains('open')) {
            chat.classList.add('open');
            if(toggleBtn) toggleBtn.classList.add('hidden');
        }
    }
}, 2000);

function openChatWithPrefill(text) {
    const chat = document.getElementById('chatContainer');
    const toggleBtn = document.getElementById('chatToggleBtn');
    if(chat) chat.classList.add('open');
    if(toggleBtn) toggleBtn.classList.add('hidden');
    const input = document.getElementById('user-input');
    if(input) {
        input.value = text;
        input.style.height = "auto";
        input.style.height = (input.scrollHeight) + "px";
        input.focus();
    }
}

// Auto-expanding textarea logic
const userInput = document.getElementById("user-input");
if(userInput) {
    userInput.addEventListener("input", function() {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight) + "px";
    });
}

const sessionId = "session_" + Math.floor(Math.random() * 1000000000);
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");
const typingIndicator = document.getElementById("typing-indicator");

function appendMessage(text, sender) {
    if(!chatBox) return;
    const msgDiv = document.createElement("div");
    msgDiv.className = `msg ${sender}`;
    
    // Transform Stripe links into a sleek popup window
    if(text.includes('stripe.com')) {
        text = text.replace(/(https:\/\/(buy|book)\.stripe\.com\/[^\s]+)/g, '<a href="#" onclick="window.open(\'$1\', \'StripeCheckout\', \'width=450,height=750,top=100,left=100,resizable=yes,scrollbars=yes\'); return false;" style="color:var(--primary); font-weight:bold; text-decoration:underline; cursor:pointer;">Click Here to Pay via Stripe &rarr;</a>');
    }
    
    msgDiv.innerHTML = text; 
    if(typingIndicator) {
        chatBox.insertBefore(msgDiv, typingIndicator);
    } else {
        chatBox.appendChild(msgDiv);
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() { 
    if(typingIndicator && chatBox) {
        typingIndicator.style.display = "flex"; 
        chatBox.scrollTop = chatBox.scrollHeight; 
    }
}

function hideTyping() { 
    if(typingIndicator) typingIndicator.style.display = "none"; 
}

function getTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false });
}

function logTerminal(message) {
    const term = document.getElementById("telemetryTerminal");
    if (term) {
        term.innerHTML += message;
        term.scrollTop = term.scrollHeight;
    }
}

async function sendMessage() {
    if (isSending) return;

    const text = userInput ? userInput.value.trim() : "";
    if (!text) return;

    isSending = true;

    appendMessage(text, "user");
    if(userInput) {
        userInput.value = "";
        userInput.style.height = "auto";
        userInput.disabled = true;
    }
    if(sendBtn) sendBtn.disabled = true;

    showTyping();

    try {
        const demoDest = document.getElementById("demo-alert-dest") ? document.getElementById("demo-alert-dest").value.trim() : "";

        // COMMAND LINE LOGIC
        logTerminal(`<br><span style="color: #64748b">[${getTimestamp()}]</span> > POST /api/v1/engine/transmit ... <span style="color:#e2e8f0">[PENDING]</span>`);

        const liveUrl = N8N_WEBHOOK_URL + "?t=" + Date.now();
        
        const response = await fetch(liveUrl, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                sessionId: sessionId, 
                message: text,
                alert_destination: demoDest 
            })
        });

        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        hideTyping();
        appendMessage(data.text || "Sorry, I encountered an error.", "bot");

        logTerminal(`<br><span style="color: #64748b">[${getTimestamp()}]</span> > RESPONSE RECEIVED ... <span style="color:#10b981">[200 OK]</span>`);

        // If AI deployed the Stripe link, simulate the backend process
        if(data.ready_to_pay === true || data.ready_to_pay === "true") {
            
            setTimeout(() => {
                logTerminal(`<br><span style="color: #64748b">[${getTimestamp()}]</span> > SQL_INSERT into public.leads ... <span style="color:#10b981">[SUCCESS]</span>`);
            }, 800);

            setTimeout(() => {
                logTerminal(`<br><span style="color: #64748b">[${getTimestamp()}]</span> > GENERATING STRIPE CHECKOUT SESSION ... <span style="color:#10b981">[SUCCESS]</span>`);
            }, 1800);

            setTimeout(() => {
                if (demoDest) {
                    logTerminal(`<br><span style="color: #64748b">[${getTimestamp()}]</span> > DISPATCH_MAIL_SMTP: Routing to <b>${demoDest}</b> ... <span style="color:#3b82f6">[QUEUED & SENT]</span>`);
                    
                    try {
                        let ding = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                        ding.volume = 0.5;
                        ding.play();
                    } catch(e) {}
                    
                    const panel = document.getElementById("backendPanel");
                    if (panel && !panel.classList.contains("open")) {
                        panel.classList.add("open");
                    }
                } else {
                    logTerminal(`<br><span style="color: #64748b">[${getTimestamp()}]</span> > <span style="color:#f59e0b">WARN: alert_destination is null. Skipping SMTP dispatch.</span>`);
                }
            }, 3000);
        }

    } catch (error) {
        hideTyping();
        console.error("Transmission Error:", error);
        appendMessage("Network error or outdated browser detected. Please check your connection or call us directly.", "bot");
        logTerminal(`<br><span style="color: #64748b">[${getTimestamp()}]</span> > <span style="color:#ef4444">FATAL_ERR: Webhook connection failed.</span>`);
    } finally {
        if(userInput) {
            userInput.disabled = false;
            userInput.focus();
        }
        if(sendBtn) sendBtn.disabled = false;
        
        isSending = false; 
    }
}

function handleKeyPress(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}