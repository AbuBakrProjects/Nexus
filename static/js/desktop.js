async function loadHTML(elementId, url) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Missing element: #${elementId}`);
        return false;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${url} returned ${response.status}`);
        element.innerHTML = await response.text();
        return true;
    } catch (error) {
        console.error(`Failed to load ${url}:`, error);
        return false;
    }
}

function updateClock() {
    const clock = document.getElementById("clock");
    if (!clock) return;
    const now = new Date();
    clock.textContent = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function playMessageSound() {
    const sound = document.getElementById("notificationSound");
    if (!sound) return;
    sound.currentTime = 0;
    sound.play().catch(() => document.addEventListener("click", () => sound.play().catch(() => {}), { once: true }));
}

function showNewMessageNotification(messageStage = 0) {
    const container = document.getElementById("notificationContainer");
    const badge = document.getElementById("messageBadge");
    if (badge) badge.classList.remove("hidden");
    if (!container) return;
    document.querySelector(".system-notification")?.remove();
    const previews = { 0: "If you're seeing this...", 1: "You found the part I was worried about.", 2: "So. Now you know.", 3: "You found the second trace.", 4: "You found the watcher." };
    const notification = document.createElement("div");
    notification.className = "system-notification";
    notification.innerHTML = `<div class="notification-icon">✉</div><div class="notification-text"><div class="notification-title">NEW MESSAGE</div><div class="notification-from">UNKNOWN</div><div class="notification-preview">${previews[messageStage] || "You have a new message."}</div></div>`;
    notification.addEventListener("click", () => { notification.remove(); openMessages(); });
    container.appendChild(notification);
    playMessageSound();
    setTimeout(() => notification.remove(), 7000);
}

async function openApp(url, id, initialize) {
    const existing = document.getElementById(id);
    if (existing) {
        existing.style.zIndex = "3000";
        if (typeof initialize === "function") initialize(existing);
        return existing;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${url} returned ${response.status}`);
        document.body.insertAdjacentHTML("beforeend", await response.text());
        const windowElement = document.getElementById(id);
        if (!windowElement) throw new Error(`${id} was not created.`);
        setupWindow(windowElement);
        windowElement.style.zIndex = "3000";
        if (typeof initialize === "function") initialize(windowElement);
        return windowElement;
    } catch (error) {
        console.error(`Failed to open ${url}:`, error);
    }
}

function openTerminal() {
    return openApp("/apps/terminal", "terminalWindow", initializeTerminal).then(() => document.getElementById("commandInput")?.focus());
}

async function openMessages() {
    await openApp("/apps/messages", "messagesWindow", updateMessages);
    await fetch("/api/messages/read", { method: "POST" });
    document.getElementById("messageBadge")?.classList.add("hidden");
    document.getElementById("messageListBadge")?.classList.add("hidden");
}

function openFiles() { return openApp("/apps/files", "filesWindow", initializeFiles); }
function openBrowser() { return openApp("/apps/browser", "browserWindow", initializeBrowser); }
function openLogs() { return openApp("/apps/logs", "logsWindow"); }

function openNova() {
    if (typeof novaSay === "function") {
        novaSay("Hey, explorer.\n\nI'm still here. Check your messages if you want to continue the investigation, or open the terminal when you're ready.", 8000);
        return;
    }
    initializeNova?.();
}

async function updateMessages() {
    try {
        const response = await fetch("/api/messages");
        if (!response.ok) throw new Error("Message API failed.");
        const data = await response.json();
        const messageBody = document.querySelector(".message-body");
        const messagePreview = document.querySelector(".message-preview");
        const messageList = document.querySelector(".message-list");
        if (!messageBody) return;
        const messages = data.messages || [];
        const current = messages.at(-1);
        if (current) {
            messageBody.textContent = current.text;
            document.querySelector(".message-header").textContent = current.sender || "UNKNOWN";
            document.querySelector(".message-time").textContent = current.time || "JUST NOW";
            if (messagePreview) messagePreview.textContent = current.text.split("\n").find(Boolean) || "New message.";
        } else {
            messageBody.textContent = `If you're seeing this, then NEXUS came back online.\n\nIt wasn't supposed to.\n\nThe last shutdown was recorded.\n\nThe restart wasn't.\n\nStart by looking around.\n\nOpen the terminal.\n\n— UNKNOWN`;
            if (messagePreview) messagePreview.textContent = "Open it.";
        }
        if (!messageList) return;
        messageList.innerHTML = "";
        messages.forEach((message, index) => {
            const item = document.createElement("button");
            item.className = `message-item${index === messages.length - 1 ? " active" : ""}`;
            item.innerHTML = `<div class="message-sender">${message.sender || "UNKNOWN"}</div><div class="message-preview">${(message.text || "").split("\n").find(Boolean) || "Message"}</div>`;
            item.addEventListener("click", () => {
                messageBody.textContent = message.text || "";
                document.querySelector(".message-header").textContent = message.sender || "UNKNOWN";
                document.querySelector(".message-time").textContent = message.time || "JUST NOW";
                document.querySelectorAll(".message-item").forEach(element => element.classList.remove("active"));
                item.classList.add("active");
            });
            messageList.appendChild(item);
        });
    } catch (error) {
        console.error("Could not update messages:", error);
    }
}

document.addEventListener("click", event => {
    if (event.target.closest("button")) window.playClickSound?.();
    if (event.target.closest("#terminalButton, #terminalDesktopIcon")) return void openTerminal();
    if (event.target.closest("#messagesButton, #messagesIcon")) return void openMessages();
    if (event.target.closest("#filesIcon")) return void openFiles();
    if (event.target.closest("#browserIcon")) return void openBrowser();
    if (event.target.closest("#gamesButton, #gamesDesktopIcon")) return void openGames();
    if (event.target.closest("#novaDesktopIcon")) return void openNova();
    if (event.target.closest("#logsDesktopIcon")) return void openLogs();
    if (event.target.closest("#missionsIcon")) return void openMissions();
    if (event.target.closest("#evidenceIcon")) return void openEvidence();
    if (event.target.closest("#networkIcon")) return void openNetwork();
    if (event.target.closest("#securityIcon")) return void openSecurity();
});

async function syncMessageBadge() {
    try {
        const response = await fetch("/api/messages");
        if (!response.ok) return;
        const data = await response.json();
        const badge = document.getElementById("messageBadge");
        const networkAlert = document.getElementById("networkAlertBadge");
        const securityAlert = document.getElementById("securityAlertBadge");
        const stateResponse = await fetch("/api/state");
        const state = stateResponse.ok ? await stateResponse.json() : {};
        networkAlert?.classList.toggle("hidden", !state.network_scan_found);
        securityAlert?.classList.toggle("hidden", !state.access_log_found);
        if (!badge) return;
        document.getElementById("messagesIcon")?.classList.toggle("has-new", data.unread_messages > 0);
        if (data.unread_messages > 0) {
            badge.textContent = data.unread_messages > 9 ? "9+" : data.unread_messages;
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }
    } catch (error) {
        console.error("Could not sync message badge:", error);
    }
}

async function startDesktop() {
    const panelLoaded = await loadHTML("panel", "/panel");
    const desktopLoaded = await loadHTML("desktop", "/desktop");
    if (!panelLoaded || !desktopLoaded) {
        console.error("Desktop failed to initialize.");
        return;
    }
    updateClock();
    syncMessageBadge();
}

startDesktop();
setInterval(updateClock, 1000);
