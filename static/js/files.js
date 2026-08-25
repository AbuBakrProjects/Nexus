async function initializeFiles(root) {
    if (!root) return;
    root.dataset.initialized = "true";
    try {
        const response = await fetch("/api/state");
        const state = response.ok ? await response.json() : {};
        const tree = root.querySelector(".file-tree");
        if (!tree) return;
        const items = ["📁 Desktop", "📁 Documents", "📁 Downloads", "📄 readme.txt", "📄 notes.txt"];
        if (state.network_scan_found) items.push("📄 network_trace.txt");
        if (state.watcher_process_found) items.push("📄 watcher_note.txt");
        tree.innerHTML = items.map(item => `<div>${item}</div>`).join("") + `<div class="files-hint">Use TERMINAL for the full NEXUS filesystem.</div>`;
    } catch (error) { console.error("Files state failed:", error); }
}
window.initializeFiles = initializeFiles;
