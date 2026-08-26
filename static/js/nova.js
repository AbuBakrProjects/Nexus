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
        start: "That message is unusual.\n\nBefore we investigate the sender, we should establish what we're working with.\n\nI can tell you what the system reports about itself, but I won't tell you where to look.\n\nStart with the terminal. There are commands that can tell you who you're operating as and what machine you're connected to.",
        terminal: "Start with the machine's basic identity.\n\nThere are commands that can tell you which user is operating the system and what this machine calls itself.",
        identity: "We know who you're operating as.\n\nNow find out what else the system tells you about this machine.",
        network: "The hostname identifies the machine, but it doesn't tell us where that machine exists on the network.\n\nLet's check NEXUS's current network configuration.",
        ipconfig: "There we are.\n\nNEXUS is currently using 192.168.1.24. That's a network identity we can actually investigate.\n\nBut something isn't right. Something changed.",
        root: "Interesting. There's a dedicated Logs directory.\n\nIf something changed on this machine, that's one of the first places I'd investigate.",
        logs: "There are several logs here.\n\nWe're looking for the change in NEXUS's network identity. Start with the network information.",
        network_log: "There.\n\nNEXUS used to have another address: 192.168.1.17.\n\nThe change happened at 03:17. One second later, NEXUS-WATCH was initialized. That's too close together to ignore.",
        access_log: "The network log recorded a remote connection immediately before the configuration changed.\n\nThe source address was 192.168.1.44. Let's find out whether that address appears anywhere else.",
        nmap: "We have an IP address, but that's all we have.\n\nBefore we assume it's an attacker, let's find out what the machine is actually exposing.\n\nInvestigate 192.168.1.44.",
        netstat: "Look at the connection carefully.\n\nThe local address is NEXUS. The foreign address is .44. We still need to connect this activity to something running inside NEXUS.",
        tasklist: "Every active program on a computer runs as a process.\n\nIf something inside NEXUS is communicating with .44, there should be a process responsible for it.",
        pid: "We have something useful now: nexus-watch.exe, PID 3172.\n\nLet's connect that process to the network connection.",
        wmic: "The watcher lives inside the NEXUS installation.\n\nNow find its configuration and see what it was designed to monitor.",
        watcher_config: "The configuration tells us what NEXUS is watching.\n\nIt doesn't yet tell us why.",
        system_log: "The sequence is starting to make sense.\n\nNow verify which account .44 tried to authenticate as.",
        net_user: "Administrator exists.\n\nSo the username wasn't random. Check the timing of the failed attempts.",
        attempts: "Five attempts in less than five seconds.\n\nThe attempts stopped at 03:16:55, but the security event came later. There are six seconds we haven't explained.",
        missing: "Find out what happened between 03:16:55 and 03:17:01.\n\nThe network log may contain something the system log doesn't.",
        temp: "Data transferred to a machine has to be handled somewhere.\n\nLook for anything created around 03:16.",
        recovery: "That's not what I expected.\n\nThe message says the watcher isn't for .44. It's warning us about something inside NEXUS.",
        watcher_log: "The watcher isn't only monitoring .44.\n\nIt can perform a local action when it detects something.",
        isolate: "Isolate.\n\nThat's an automated security response. But why was the watcher changed specifically for .44?",
        original: "The original watcher was passive and log-only.\n\nSomeone changed its configuration later. Find out who authorized the original system.",
        admin_record: "Abubakr authorized the original watcher, but that account is revoked.\n\nNow we need to find who changed the current configuration.",
        modified: "The watcher configuration was modified at exactly 03:17:04 by SYSTEM.\n\nSomething instructed the system to change it.",
        sync: "I don't remember seeing nexus-sync.exe earlier.\n\nCheck when it started and what it connects to.",
        sync_connection: "nexus-sync.exe started one second before nexus-watch and connected to .44.\n\nThe watcher wasn't the beginning. It was the response.",
        sync_config: "Recovery.\n\nNEXUS was attempting to synchronize with .44. We still don't know what it was trying to recover.",
        complete: "We have a new lead.\n\n03:17 was not the beginning. Something happened before that.\n\nWhatever NEXUS was trying to recover appears to be the reason .44 exists in the first place."
    };
    if (messages[stage]) novaSay(messages[stage], 10000, stage);
}

window.initializeNova = initializeNova;
window.novaSay = novaSay;
window.novaProgress = novaProgress;
window.requestNovaHint = requestNovaHint;
window.addEventListener("load", initializeNova);
