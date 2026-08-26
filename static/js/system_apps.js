async function openSystemApp(url, id, initializer) {
    const existing = document.getElementById(id);
    if (existing) {
        existing.style.zIndex = "3000";
        initializer?.(existing);
        return existing;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${url} returned ${response.status}`);
        document.body.insertAdjacentHTML("beforeend", await response.text());
        const windowElement = document.getElementById(id);

        if (!windowElement) {
            throw new Error(`${id} was not created.`);
        }

        setupWindow(windowElement);
        windowElement.style.zIndex = "3000";
        initializer?.(windowElement);
        playOpenSound?.();
        return windowElement;
    } catch (error) { console.error(`Failed to open ${url}:`, error); }
}

async function openMissions() {
    return openSystemApp("/apps/missions", "missionsWindow", initializeMissions);
}

async function openEvidence() {
    return openSystemApp("/apps/evidence", "evidenceWindow", updateEvidence);
}

async function openNetwork() {
    return openSystemApp("/apps/network", "networkWindow", updateSystemApps);
}

async function openSecurity() {
    return openSystemApp("/apps/security", "securityWindow", updateSystemApps);
}

async function fetchState() {
    const response = await fetch("/api/state");
    return response.ok ? response.json() : {};
}

async function initializeMissions() {
    const root = document.getElementById("missionsWindow");
    if (!root) return;
    if (!root.dataset.initialized) {
        root.dataset.initialized = "true";
        root.querySelectorAll(".system-tab").forEach(tab => tab.addEventListener("click", () => {
            root.querySelectorAll(".system-tab").forEach(item => item.classList.remove("active"));
            root.querySelectorAll("[data-panel]").forEach(panel => panel.classList.add("hidden-panel"));
            tab.classList.add("active");
            root.querySelector(`[data-panel="${tab.dataset.tab}"]`)?.classList.remove("hidden-panel");
            playClickSound?.();
        }));
    }
    const state = await fetchState();
    const trail = [
        ["ipconfig_found", "Identified NEXUS as 192.168.1.24", "Establish the network identity"],
        ["root_dir_found", "Found the machine records", "Run dir"],
        ["network_log_found", "Read network.log", "Find the 03:17 change"],
        ["access_log_story_found", "Found 192.168.1.44", "Check the access record"],
        ["network_scan_found", "Scanned .44", "Identify its services"],
        ["netstat_found", "Correlated the connection", "Compare local and foreign addresses"],
        ["tasklist_found", "Found nexus-watch.exe", "Inspect running processes"],
        ["watcher_pid_found", "Linked PID 3172 to .44", "Correlate process and network evidence"],
        ["watcher_config_found", "Read watcher configuration", "Find out what it monitors"],
        ["admin_target_found", "Verified Administrator exists", "Check the failed authentication"],
        ["password_attempts_found", "Found five rapid attempts", "Reconstruct the timeline"],
        ["missing_seconds_found", "Explained the missing six seconds", "Compare network activity"],
        ["recovery_message_found", "Found the recovery request", "Read the transferred file"],
        ["watcher_log_found", "Found LOCAL ACTION", "Inspect the watcher log"],
        ["watcher_isolate_found", "Discovered ISOLATE", "Read the current configuration"],
        ["original_config_found", "Found the original watcher", "Check the archive"],
        ["abubakr_record_found", "Found the original authorization", "Identify the old operator"],
        ["watcher_modified_found", "Found the 03:17:04 modification", "Find what caused it"],
        ["sync_process_found", "Found nexus-sync.exe", "Check when it started"],
        ["sync_connection_found", "Correlated sync with .44", "Inspect its connection"],
        ["sync_config_found", "Found RECOVERY mode", "Read sync.conf"],
        ["final_message_found", "Found the recovery lead", "Connect to .44"]
    ];
    const trailRoot = root.querySelector("#investigationTrail");
    if (trailRoot) {
        trailRoot.innerHTML = trail.map(([key, label, detail]) => `
            <div class="trail-item ${state[key] ? "done" : ""}">
                <b>${state[key] ? "✓" : "○"}</b>
                <span>${state[key] ? label : detail}</span>
            </div>
        `).join("");
    }
    const achievements = { first_contact: "First Contact", who_is_44: "Who Is .44?", network_ghost: "Network Ghost", the_watcher: "The Watcher" };
    const list = root.querySelector("#achievementList");
    if (list) {
        list.innerHTML = Object.entries(achievements).map(([key, name]) => `
            <div class="achievement">
                <b>${state.achievements?.includes(key) ? "✓ " : "○ "}${name}</b>
                <span>${state.achievements?.includes(key) ? "UNLOCKED" : "LOCKED"}</span>
            </div>
        `).join("");
    }
}

async function refreshOpenSystemApps() {
    if (document.getElementById("missionsWindow")) await initializeMissions();
    if (document.getElementById("evidenceWindow")) await updateEvidence();
    if (document.getElementById("networkWindow")) await updateSystemApps();
    if (document.getElementById("securityWindow")) await updateSystemApps();
}

async function updateEvidence() {
    const state = await fetchState();
    const count = document.getElementById("evidenceCount");
    const list = document.getElementById("evidenceList");
    const detail = document.getElementById("evidenceDetail");
    const records = state.evidence_history || [];
    if (count) count.textContent = records.length;
    if (list) {
        list.innerHTML = records.map(item => `<button class="evidence-pill" data-evidence-id="${item.id}">✓ ${item.source}</button>`).join("");
        list.querySelectorAll(".evidence-pill").forEach(button => button.addEventListener("click", () => {
            const item = records.find(record => record.id === button.dataset.evidenceId);
            list.querySelectorAll(".evidence-pill").forEach(element => element.classList.remove("active"));
            button.classList.add("active");
            if (detail && item) detail.textContent = `SOURCE: ${item.source}
TIME: ${item.time}
FINDING: ${item.finding}
STATUS: ${item.status}`;
            playClickSound?.();
        }));
    }
}

async function updateSystemApps() {
    const state = await fetchState();
    const watcher = document.getElementById("securityWatcher");
    const network = document.getElementById("securityNetwork");
    const auth = document.getElementById("securityAuth");
    const securityState = document.getElementById("securityState");
    const active = document.querySelector("#networkWindow .network-header b");
    const suspicious = document.querySelector("#networkWindow .suspicious");
    const evidence44 = document.getElementById("evidenceNode44");
    const evidenceWatcher = document.getElementById("evidenceNodeWatcher");
    if (watcher) watcher.textContent = state.watcher_process_found ? "✓ NEXUS-WATCH FOUND" : "UNKNOWN";
    if (network) network.textContent = state.watcher_process_found ? "⚠ WATCHER PROCESS DETECTED" : state.network_scan_found ? "⚠ .44 SERVICE DISCOVERED" : state.access_log_found ? "⚠ UNKNOWN NODE" : "MONITORING";
    if (auth) auth.textContent = state.access_log_found ? "⚠ REPEATED FAILURES" : "MONITORING";
    if (securityState) securityState.textContent = state.watcher_process_found ? "WATCHER DETECTED" : state.access_log_found ? "INVESTIGATION ACTIVE" : "MONITORING";
    if (active) active.textContent = state.watcher_process_found ? "WATCHER DETECTED" : state.access_log_found ? "3 ACTIVE CONNECTIONS" : "2 ACTIVE CONNECTIONS";
    if (suspicious) suspicious.innerHTML = state.access_log_story_found ? ".44<br><small>UNKNOWN NODE</small>" : "?<br><small>UNKNOWN</small>";
    if (evidence44) evidence44.style.display = state.access_log_story_found ? "" : "none";
    if (evidenceWatcher) evidenceWatcher.style.display = state.watcher_process_found ? "" : "none";
}

window.openMissions = openMissions;
window.openEvidence = openEvidence;
window.openNetwork = openNetwork;
window.openSecurity = openSecurity;
window.initializeMissions = initializeMissions;
window.updateEvidence = updateEvidence;
window.updateSystemApps = updateSystemApps;

window.refreshOpenSystemApps = refreshOpenSystemApps;
