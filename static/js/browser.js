async function initializeBrowser(root) {
    if (!root) return;
    root.dataset.initialized = "true";
    const input = root.querySelector(".browser-address");
    const button = root.querySelector(".browser-go");
    const page = root.querySelector(".browser-page");
    let state = {};
    try { const response = await fetch("/api/state"); state = response.ok ? await response.json() : {}; } catch (error) { console.error(error); }
    const pages = {
        "nexus://local": ["NEXUS LOCAL", "Internal node services are available.", "Try the terminal if you need raw system evidence."],
        "nexus://intranet": ["NEXUS INTRANET", "INTERNAL NETWORK", state.network_scan_found ? "SECURITY BULLETIN\n\nA legacy node remains active on the network.\nServices: SSH / HTTP / HTTPS" : "Internal route locked. Discover the external service first."],
        "http://192.168.1.44": ["192.168.1.44", "SERVICE RESPONSE", state.network_scan_found ? "This node is alive. Web service detected.\n\nArchive index: RESTRICTED" : "No route discovered yet."],
        "https://192.168.1.44": ["192.168.1.44 · SECURE", "TLS ENDPOINT", state.network_scan_found ? "Certificate subject: archive-node\nIssuer: NEXUS Internal CA" : "TLS endpoint not yet known to NEXUS."],
        "http://archive.local": ["ARCHIVE NODE", "RESTRICTED", state.system_log_found ? "Archive index unavailable.\nLast activity: 03:17" : "Route unavailable. More evidence is required."]
    };
    const navigate = () => {
        const address = input.value.trim().toLowerCase();
        const result = pages[address];
        if (!result) { page.innerHTML = `<div class="browser-logo">NO ROUTE</div><p>${address || "EMPTY ADDRESS"}</p><p class="browser-muted">Try nexus://local or a route you have discovered.</p>`; playErrorSound?.(); return; }
        page.innerHTML = `<div class="browser-logo">${result[0]}</div><p>${result[1]}</p><pre>${result[2]}</pre>`;
        playSuccessSound?.();
    };
    button?.addEventListener("click", navigate);
    input?.addEventListener("keydown", event => { if (event.key === "Enter") navigate(); });
}
window.initializeBrowser = initializeBrowser;
