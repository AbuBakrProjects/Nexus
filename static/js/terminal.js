function initializeTerminal() {
    const input = document.getElementById("commandInput");
    const output = document.getElementById("terminalOutput");
    const body = document.getElementById("terminalBody");
    const prompt = document.getElementById("terminalPrompt");
    if (!input || !output || !body || !prompt) {
        console.error("Terminal initialization failed.");
        return;
    }
    if (input.dataset.initialized === "true") return;
    input.dataset.initialized = "true";
    let currentDirectory = "/home/nexus";
    const novaStagesShown = new Set();
    let experimentErrors = 0;

    function displayPath() { return currentDirectory === "/home/nexus" ? "~" : currentDirectory; }
    function updatePrompt() { prompt.textContent = `nexus@node:${displayPath()}$`; }
    function escapeHTML(text) { const element = document.createElement("div"); element.textContent = text; return element.innerHTML; }

    function addCommand(command, result) {
        const commandLine = document.createElement("div");
        commandLine.className = "terminal-line";
        commandLine.innerHTML = `<span class="terminal-prompt">nexus@node:${displayPath()}$</span> ${escapeHTML(command)}`;
        output.appendChild(commandLine);
        if (result) {
            const resultLine = document.createElement("div");
            resultLine.className = "terminal-line";
            resultLine.textContent = result;
            output.appendChild(resultLine);
        }
        body.scrollTop = body.scrollHeight;
    }

    function showNovaStage(stage) {
        if (typeof novaProgress !== "function" || novaStagesShown.has(stage)) return;
        novaStagesShown.add(stage);
        novaProgress(stage);
    }

    function handleNovaProgress(command, data) {
        const normalized = command.trim().replace(/\s+/g, " ");
        if (/^(ls|cd|cat|type): /.test(data.output || "")) return;
        const stages = {
            "whoami":"identity",
            "hostname":"network",
            "ipconfig":"ipconfig",
            "nmap 192.168.1.44":"nmap",
            "netstat":"netstat",
            "netstat -ano":"netstat",
            "tasklist":"tasklist",
            "net user":"net_user",
            "connect 192.168.1.44":"complete"
        };
        if (stages[normalized]) return showNovaStage(stages[normalized]);
        if ((normalized === "dir" || normalized === "ls") && data.cwd === "/") return showNovaStage("root");
        if ((normalized === "cd Logs" || normalized === "cd /logs") && data.cwd === "/logs") return showNovaStage("logs");
        if ((normalized === "type network.log" || normalized === "cat network.log") && data.cwd === "/logs") return showNovaStage("network_log");
        if ((normalized === "type access.log" || normalized === "cat access.log") && data.cwd === "/logs") return showNovaStage("access_log");
        if ((normalized === "cd /NEXUS/temp" || normalized === "cd nexus/temp") && data.cwd === "/NEXUS/temp") return showNovaStage("temp");
        if ((normalized === "type session_0316.tmp" || normalized === "cat session_0316.tmp") && data.cwd === "/NEXUS/temp") return showNovaStage("recovery");
        if ((normalized === "type service.log" || normalized === "cat service.log") && data.cwd === "/NEXUS/services") return showNovaStage("watcher_log");
        if ((normalized === "type watch.conf" || normalized === "cat watch.conf") && data.cwd === "/NEXUS/services") return showNovaStage("watcher_config");
        if ((normalized === "type watcher_original.conf" || normalized === "cat watcher_original.conf") && data.cwd === "/NEXUS/archive") return showNovaStage("original");
        if ((normalized === "type admin_record.txt" || normalized === "cat admin_record.txt") && data.cwd === "/NEXUS/archive") return showNovaStage("admin_record");
        if ((normalized === "type sync.conf" || normalized === "cat sync.conf") && data.cwd === "/NEXUS/services") return showNovaStage("sync_config");
        if ((normalized === "type system.log" || normalized === "cat system.log") && data.cwd === "/logs") return showNovaStage("system_log");
        if (normalized.startsWith("wmic process where")) return showNovaStage("wmic");
    }

    async function runCommand(command) {
        try {
            const response = await fetch("/api/terminal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ command, cwd: currentDirectory }) });
            if (!response.ok) throw new Error("Terminal backend error.");
            const data = await response.json();
            const oldDirectory = currentDirectory;
            if (data.output === "__CLEAR__") output.innerHTML = "";
            else addCommand(command, data.output);
            if (typeof data.cwd === "string" && data.cwd.startsWith("/")) currentDirectory = data.cwd;
            else currentDirectory = oldDirectory;
            updatePrompt();
            if (data.new_message) {
                showNewMessageNotification(data.message_stage);
                if (document.getElementById("messagesWindow")) await updateMessages();
            }
            if (data.challenge_complete) { if (data.chapter_complete) showChapterComplete(); else showMissionDebrief(data.cwd); }
            if (data.output && (command.startsWith("cat ") || command.startsWith("type ") || command === "nmap 192.168.1.44" || command === "ps" || command === "tasklist" || command.startsWith("netstat"))) playSuccessSound?.();
            if (typeof syncMessageBadge === "function") syncMessageBadge();
            if (typeof refreshOpenSystemApps === "function") refreshOpenSystemApps();
            if (/^(ls|cd|cat): /.test(data.output || "")) {
                playErrorSound?.();
                experimentErrors += 1;
                if (experimentErrors === 3) novaSay?.("That's okay. Terminal work involves a lot of small mistakes. Read the error, check pwd or ls, and try again. I'm not counting that against you.", 7000, "experiment");
            } else if (command.trim()) {
                experimentErrors = 0;
            }
            handleNovaProgress(command, data);
            input.focus();
        } catch (error) {
            console.error(error);
            addCommand(command, "NEXUS: connection to system failed.");
            playErrorSound?.();
            input.focus();
        }
    }

    input.addEventListener("keydown", event => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        const command = input.value.trim();
        if (!command) return;
        input.value = "";
        runCommand(command);
    });
    body.addEventListener("click", () => input.focus());
    updatePrompt();
    input.focus();
    setTimeout(() => showNovaStage("terminal"), 500);
}

window.initializeTerminal = initializeTerminal;

function showMissionDebrief() {
    const modal = document.getElementById("missionDebrief");
    const discovered = document.getElementById("debriefDiscovered");
    const learned = document.getElementById("debriefLearned");
    if (!modal || !discovered || !learned) return;
    fetch("/api/state").then(response => response.json()).then(state => {
        const completed = state.challenge03_complete ? 3 : state.challenge02_complete ? 2 : state.challenge01_complete ? 1 : 0;
        const info = {
            1: [["192.168.1.24", "192.168.1.44", "03:17 network change"], "How to establish machine identity, navigate a filesystem, read logs, and distinguish local from remote network activity."],
            2: [["nexus-watch.exe", "PID 3172", "03:16:56–03:16:59 data transfer"], "How process IDs, network connections, authentication events, and timestamps can be correlated during an investigation."],
            3: [["Recovery request", "Watcher configuration", "nexus-sync.exe"], "How configuration history, process creation, and network evidence can reveal the difference between an attack and a recovery operation."]
        }[completed];
        if (!info) return;
        discovered.innerHTML = `<div class="debrief-section"><b>YOU DISCOVERED</b><div>• ${info[0][0]}<br>• ${info[0][1]}<br>• ${info[0][2]}</div></div>`;
        learned.innerHTML = `<div class="debrief-section"><b>WHAT YOU LEARNED</b><div>${info[1]}</div></div>`;
        modal.classList.remove("hidden");
        playSuccessSound?.();
    });
}

function showChapterComplete() {
    const modal = document.getElementById("chapterComplete");
    if (!modal) return;
    modal.classList.remove("hidden");
    playSuccessSound?.();
}
window.showChapterComplete = showChapterComplete;

document.addEventListener("click", event => { if (event.target.id === "debriefClose") document.getElementById("missionDebrief")?.classList.add("hidden"); });
window.showMissionDebrief = showMissionDebrief;
