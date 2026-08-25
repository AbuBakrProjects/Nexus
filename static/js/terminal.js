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
        if (data.output?.startsWith("ls: ") || data.output?.startsWith("cd: ") || data.output?.startsWith("cat: ")) return;
        if (normalized === "ls" && currentDirectory === "/home/nexus") return showNovaStage("home");
        if (normalized === "ls /") return showNovaStage("root");
        if (normalized === "ls /logs") return showNovaStage("logs");
        if (normalized === "cat /logs/access.log") return showNovaStage("suspicious_ip");
        if (normalized === "ls /etc") return showNovaStage("etc");
        if (normalized === "cat /etc/network.conf") return showNovaStage("network_config");
        if (normalized === "nmap 192.168.1.44") return showNovaStage("nmap");
        if (normalized === "cat /logs/system.log") return showNovaStage("system_log");
        if (normalized === "ps") return showNovaStage("ps");
        if (normalized === "netstat") return showNovaStage("netstat");
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
            if (data.challenge_complete) showMissionDebrief(data.cwd);
            if (data.output && (command.startsWith("cat ") || command === "nmap 192.168.1.44" || command === "ps" || command === "netstat")) playSuccessSound?.();
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
            1: [["/logs/access.log", "192.168.1.44", "NEXUS address: 192.168.1.24"], "How to navigate a Linux-like filesystem, read logs, and compare network addresses to distinguish local from remote activity."],
            2: [["Open services on 192.168.1.44", "SSH / HTTP / HTTPS", "03:17 security event"], "What network scanning does: it reveals reachable services and helps you understand a host's attack surface."],
            3: [["nexus-watch process", "Established .44 connection", "03:17 watcher activity"], "How process inspection and connection inspection can be correlated to build a stronger forensic conclusion."]
        }[completed];
        if (!info) return;
        discovered.innerHTML = `<div class="debrief-section"><b>YOU DISCOVERED</b><div>• ${info[0][0]}<br>• ${info[0][1]}<br>• ${info[0][2]}</div></div>`;
        learned.innerHTML = `<div class="debrief-section"><b>WHAT YOU LEARNED</b><div>${info[1]}</div></div>`;
        modal.classList.remove("hidden");
        playSuccessSound?.();
    });
}
document.addEventListener("click", event => { if (event.target.id === "debriefClose") document.getElementById("missionDebrief")?.classList.add("hidden"); });
window.showMissionDebrief = showMissionDebrief;
