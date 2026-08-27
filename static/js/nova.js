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

async function getCurrentNovaStage() {
    try {
        const response = await fetch("/api/state", { cache: "no-store" });
        if (!response.ok) return "start";
        const s = await response.json();

        if (s.chapter01_complete) return "complete";

        if (s.challenge02_complete) {
            if (!s.watcher_log_found) return "watcher_log";
            if (!s.watcher_isolate_found) return "isolate";
            if (!s.original_config_found) return "original";
            if (!s.abubakr_record_found) return "admin_record";
            if (!s.watcher_modified_found) return "modified";
            if (!s.sync_process_found) return "sync";
            if (!s.sync_connection_found) return "sync_connection";
            if (!s.sync_config_found) return "sync_config";
            return "complete";
        }

        if (s.challenge01_complete) {
            if (!s.netstat_found) return "netstat";
            if (!s.watcher_pid_found) return "pid";
            if (!s.watcher_config_found) return "wmic";
            if (!s.system_log_found) return "system_log";
            if (!s.admin_target_found) return "net_user";
            if (!s.password_attempts_found) return "attempts";
            if (!s.missing_seconds_found) return "missing";
            if (!s.temp_file_found) return "temp";
            if (!s.recovery_message_found) return "recovery";
        }

        if (!s.ipconfig_found) {
            if (s.story_scene <= 1) return "start";
            if (s.story_scene === 2) return "identity";
            return "network";
        }
        if (!s.root_dir_found) return "ipconfig";
        if (!s.logs_dir_found) return "root";
        if (!s.network_log_found) return "logs";
        if (!s.access_log_story_found) return "network_log";
        if (!s.nmap_found) return "access_log";
        if (!s.tasklist_found) return "nmap";
        if (!s.netstat_found) return "tasklist";

        return "netstat";
    } catch (error) {
        console.error("Could not determine NOVA story stage:", error);
        return "start";
    }
}

async function novaProgress(stage = "") {
    const messages = {
        start: "That message is unusual.\n\nBefore we investigate the sender, establish what machine you're actually sitting on.\n\nOpen the terminal and start with the command that tells you which user is operating NEXUS.\n\nNEXT: Check which user is operating NEXUS.",
        terminal: "Let's establish the machine's identity before touching the evidence.\n\nThe first command tells us which account is operating NEXUS.\n\nNEXT: Check which user is operating NEXUS.",
        identity: "Good. We know which account is operating NEXUS.\n\nNow find out what this machine calls itself. That gives us the second piece of its identity.\n\nNEXT: Check what this machine is called.",
        network: "Now we know the machine name. Next we need its network identity.\n\nCheck the current network configuration so we can see which address NEXUS is using.\n\nNEXT: Check NEXUS's current network configuration.",
        ipconfig: "There we are. NEXUS is using 192.168.1.24.\n\nThat gives us something concrete to investigate. If the machine's network identity changed, there should be a record of it.\n\nNEXT: Look at the top-level folders.",
        root: "Interesting. You found the top-level folders.\n\nA change like this should leave traces. Look for the folder where NEXUS keeps its records.\n\nNEXT: Look for the Logs folder.",
        logs: "You're in the Logs directory. Now narrow the search to the network change.\n\nRead the network log first; we're looking for what happened around 03:17.\n\nNEXT: Read network.log.",
        network_log: "The network log gives us the first real lead: 192.168.1.44 appears immediately before the 03:17 change.\n\nDon't jump to conclusions yet. Check the access record to confirm what .44 was doing.\n\nNEXT: Read access.log.",
        access_log: "Now we have a remote address and a confirmed connection: 192.168.1.44.\n\nBefore treating it as an attacker, investigate what that host is exposing.\n\nNEXT: Investigate what 192.168.1.44 is exposing.",
        nmap: "The scan tells us what .44 exposes, but not what on NEXUS is involved with that connection.\n\nWe need to identify the local process that was active when .44 appeared in the trace.\n\nNEXT: Check the running processes.",
        tasklist: "There it is: nexus-watch.exe is running with PID 3172.\n\nThe first network trace is reconstructed. Now we need to verify whether that process is actually connected to .44.\n\nNEXT: Check NEXUS's active network connections.",
        netstat: "The connection is real: NEXUS is communicating with 192.168.1.44.\n\nNow we need to connect that network connection to the exact process responsible for it.\n\nNEXT: Match the network connection to its process.",
        pid: "We found nexus-watch.exe, PID 3172.\n\nA process name alone isn't enough. Compare that PID with the network connection so we can prove the watcher owns it.\n\nNEXT: Match the process to the network connection.",
        wmic: "PID 3172 belongs to nexus-watch.exe, and now we know where that executable lives.\n\nGo into the NEXUS services directory and inspect the watcher's configuration.\n\nNEXT: Go to the NEXUS services folder and inspect the watcher configuration.",
        watcher_config: "You found the watcher's configuration.\n\nRead it carefully. We need to know its target, mode, and what it does when something goes wrong.\n\nNEXT: Read watch.conf.",
        system_log: "The watcher isn't the first event. We need the authentication timeline that happened just before it.\n\nRead the system log and look at the failed administrator authentication attempts around 03:16.\n\nNEXT: Read system.log.",
        net_user: "Administrator is a real local account on NEXUS.\n\nNow verify whether .44 actually targeted that account by checking the authentication timeline.\n\nNEXT: Read system.log.",
        attempts: "The failed attempts stop at 03:16:55, but the timeline continues afterward.\n\nThere is a gap we haven't explained. Check the network log for activity during those missing seconds.\n\nNEXT: Read network.log.",
        missing: "The missing seconds contain a transfer from .44.\n\nNow we need to find what NEXUS received or created at that time. Look in the temporary data area.\n\nNEXT: Look in the NEXUS temp folder.",
        temp: "You're in the temporary area. Something was created around 03:16, which is exactly where we should look.\n\nList the files and find the session record.\n\nNEXT: Look through the files in this folder.",
        recovery: "That session record changes the picture. .44 was sending a recovery request, not simply trying to enter NEXUS.\n\nNow follow the warning about the watcher and inspect what the watcher actually did.\n\nNEXT: Return to the NEXUS services folder.",
        watcher_log: "The service log shows the watcher detected an anomaly and enabled a local action.\n\nNow inspect the watcher's configuration to see what that action is.\n\nNEXT: Read watch.conf.",
        isolate: "The watcher can isolate the network when it detects an anomaly.\n\nBut the current configuration isn't the original one. Find the archived configuration and compare it.\n\nNEXT: Look in the archive for the original watcher configuration.",
        original: "The original watcher was passive and only logged events.\n\nSomeone later changed it. The archive points to the original authorization, so check the administrative record.\n\nNEXT: Read admin_record.txt.",
        admin_record: "The original watcher was authorized by Abubakr, but that account is revoked.\n\nWe still need to explain who or what changed the current configuration at 03:17:04.\n\nNEXT: Read the current watcher configuration.",
        modified: "The current watcher configuration was modified at 03:17:04 by SYSTEM.\n\nThat suggests another process instructed it to change. Check the running processes again.\n\nNEXT: Check the running processes.",
        sync: "There it is: nexus-sync.exe appeared just before the watcher.\n\nNow connect its PID to the network evidence.\n\nNEXT: Match the process to the network connection.",
        sync_connection: "nexus-sync.exe owns the connection to 192.168.1.44.\n\nThe watcher wasn't the beginning. Something started a recovery connection first. Read its configuration next.\n\nNEXT: Read sync.conf.",
        sync_config: "NEXUS-SYNC is operating in RECOVERY mode against 192.168.1.44.\n\nWe have enough evidence to follow the recovery connection itself.\n\nNEXT: Follow the recovery connection to 192.168.1.44.",
        complete: "You have reconstructed the chain.\n\n03:17 was not the beginning. NEXUS was trying to recover something through 192.168.1.44.\n\nCHAPTER 01 COMPLETE."
    };


    const resolvedStage = stage || await getCurrentNovaStage();
    if (messages[resolvedStage]) {
        await novaSay(messages[resolvedStage], 10000, resolvedStage);
    }
}

window.initializeNova = initializeNova;
window.novaSay = novaSay;
window.novaProgress = novaProgress;
window.requestNovaHint = requestNovaHint;

