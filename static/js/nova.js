let novaBox = null;
let novaText = null;
let novaMinimized = null;
let novaHistoryPanel = null;
let novaHistoryList = null;
let novaNewHint = null;
let novaTimeout = null;
let novaInitialized = false;
let novaCurrentStage = "";

async function initializeNova() {
    if (novaInitialized && novaBox) return;

    try {
        const response = await fetch("/nova");

        if (!response.ok) {
            throw new Error("NOVA failed to load.");
        }

        document.body.insertAdjacentHTML("beforeend", await response.text());

        novaBox = document.getElementById("novaMessageBox");
        novaText = document.getElementById("novaText");
        novaMinimized = document.getElementById("novaMinimized");
        novaHistoryPanel = document.getElementById("novaHistoryPanel");
        novaHistoryList = document.getElementById("novaHistoryList");
        novaNewHint = document.getElementById("novaNewHint");

        document.getElementById("novaMinimizedButton")?.addEventListener("click", novaRestore);
        novaMinimized?.addEventListener("click", novaRestore);
        document.getElementById("novaMinimizeButton")?.addEventListener("click", novaMinimize);
        document.getElementById("novaHistoryButton")?.addEventListener("click", openNovaHistory);
        document.getElementById("novaHistoryClose")?.addEventListener("click", closeNovaHistory);
        document.getElementById("novaHintButton")?.addEventListener("click", requestNovaHint);

        novaInitialized = true;
        await refreshNovaState();
    } catch (error) {
        console.error("NOVA failed to initialize:", error);
    }
}

function novaMinimize(markNew = true) {
    clearTimeout(novaTimeout);
    novaBox?.classList.remove("nova-show");

    if (novaMinimized) {
        novaMinimized.classList.add("show");
        novaMinimized.classList.toggle("new-hint", markNew);
    }
}

async function novaRestore() {
    if (!novaBox || !novaText) {
        await initializeNova();
    }

    if (!novaBox || !novaText) return;

    clearTimeout(novaTimeout);
    novaMinimized?.classList.remove("show", "new-hint");
    novaBox.classList.add("nova-show");

    try {
        await fetch("/api/nova/read", { method: "POST" });
    } catch (error) {
        console.error("NOVA read state failed:", error);
    }

    novaTimeout = setTimeout(() => novaMinimize(false), 9000);
}

async function novaSay(message, duration = 9000, stage = "") {
    if (!novaBox || !novaText) {
        await initializeNova();
    }

    if (!novaBox || !novaText) return;

    clearTimeout(novaTimeout);
    novaCurrentStage = stage;
    novaText.textContent = message;
    novaMinimized?.classList.remove("show", "new-hint");
    novaBox.classList.add("nova-show");
    playOpenSound?.();

    try {
        await fetch("/api/nova/record", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: message, stage })
        });
    } catch (error) {
        console.error("NOVA message state failed:", error);
    }

    await refreshNovaState();
    novaTimeout = setTimeout(() => novaMinimize(true), duration);
}

async function refreshNovaState() {
    try {
        const response = await fetch("/api/nova");

        if (!response.ok) return;

        const data = await response.json();

        if (novaMinimized && data.last_message && !novaBox?.classList.contains("nova-show")) {
            novaMinimized.classList.add("show");
        }

        if (novaMinimized) {
            novaMinimized.classList.toggle("new-hint", Boolean(data.new_hint));
        }

        if (novaHistoryList) {
            const history = (data.history || []).slice().reverse();

            novaHistoryList.innerHTML = history.map(item => `
                <article class="nova-history-item">
                    <b>NOVA</b>
                    <time>${item.time || ""}</time>
                    <p>${escapeNova(item.text || "")}</p>
                </article>
            `).join("") || `<div class="nova-history-item"><p>No previous guidance yet.</p></div>`;
        }
    } catch (error) {
        console.error("NOVA state failed:", error);
    }
}

function escapeNova(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function openNovaHistory() {
    novaHistoryPanel?.classList.add("show");
    novaHistoryPanel?.setAttribute("aria-hidden", "false");
    refreshNovaState();
}

function closeNovaHistory() {
    novaHistoryPanel?.classList.remove("show");
    novaHistoryPanel?.setAttribute("aria-hidden", "true");
}

async function requestNovaHint() {
    try {
        const response = await fetch("/api/nova/hint", { method: "POST" });
        const data = await response.json();
        await novaSay(`HINT ${data.level}/3\n\n${data.text}`, 10000, "hint");
    } catch (error) {
        console.error("NOVA hint failed:", error);
    }
}

function novaProgress(stage) {
    const messages = {
        start: "Hey, explorer.\n\nFirst: check MESSAGES. UNKNOWN left something for you.\n\nThen open TERMINAL. Good first commands:\n• ls\n• pwd\n• ls /\n\nI’ll guide you without solving the investigation for you.",
        terminal: "You're in.\n\nStart with ls. pwd tells you where you are.\n\nIf you're curious, try ls / to see the machine's top-level folders.",
        home: "Nothing too interesting here.\n\nTry ls /.\n\nLook for folders that might contain system information, logs, or missions.",
        root: "There we go. You found /logs.\n\nTry ls /logs.\n\nThen read the access records.",
        logs: "Two logs. Start with access.log.\n\nTry cat /logs/access.log.\n\nLook for repeated addresses, failed logins, and what happens before success.",
        suspicious_ip: "192.168.1.44 appears three times as a failure, then succeeds.\n\nDon't call it an attacker yet. We need evidence.\n\nTry ls /etc, then compare NEXUS's address in network.conf.",
        etc: "Exactly. /etc contains system configuration.\n\nTry cat /etc/network.conf.\n\nCompare NEXUS's address with 192.168.1.44.",
        network_config: "NEXUS is 192.168.1.24. The login source was .44.\n\nChallenge 01 is solved.\n\nNow ask what .44 was exposing.",
        nmap: "The node is alive. Read the ports carefully.\n\nThe 03:17 timestamp is your next clue.",
        system_log: "03:17. That's the timestamp UNKNOWN warned you about.\n\nNow investigate the watcher. Try ps, then netstat.",
        ps: "Look for anything that doesn't look like a normal desktop process.\n\nThe watcher may not call itself a watcher.",
        netstat: "There. A connection that doesn't fit the normal pattern.\n\nYou've connected the login, service, process, and network trace.",
        challenge03_complete: "That's enough evidence for now.\n\nSomething inside NEXUS was watching activity after the connection.\n\nThe bigger question is why.",
        goodbye: "Thanks for spending some time with NEXUS.\n\nIf you come back, keep digging. The machine has a longer memory than it admits."
    };

    if (messages[stage]) {
        novaSay(messages[stage], stage === "goodbye" ? 12000 : 9000, stage);
    }
}

window.initializeNova = initializeNova;
window.novaSay = novaSay;
window.novaProgress = novaProgress;
window.requestNovaHint = requestNovaHint;
window.addEventListener("load", initializeNova);
