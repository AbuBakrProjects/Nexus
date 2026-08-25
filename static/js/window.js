function setupWindow(windowElement) {
    if (!windowElement || windowElement.dataset.windowReady === "true") return;

    const titlebar = windowElement.querySelector(".app-titlebar, .terminal-titlebar, .messages-titlebar, .files-titlebar, .browser-titlebar, .games-titlebar, .TTT-titlebar, .ttt-titlebar, .memory-titlebar");
    if (!titlebar) {
        console.error("Window titlebar not found.");
        return;
    }

    windowElement.dataset.windowReady = "true";
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    titlebar.addEventListener("mousedown", event => {
        if (event.target.closest("button, input")) return;
        if (windowElement.dataset.maximized === "true") return;

        dragging = true;
        const rect = windowElement.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;
        windowElement.style.transform = "none";
        windowElement.style.left = `${rect.left}px`;
        windowElement.style.top = `${rect.top}px`;
        windowElement.style.zIndex = "3000";
        document.body.style.userSelect = "none";
    });

    const move = event => {
        if (!dragging) return;
        const panel = document.getElementById("panel");
        const panelHeight = panel ? panel.offsetHeight : 48;
        const maxX = Math.max(0, window.innerWidth - windowElement.offsetWidth);
        const maxY = Math.max(panelHeight, window.innerHeight - windowElement.offsetHeight);
        const x = Math.max(0, Math.min(event.clientX - offsetX, maxX));
        const y = Math.max(panelHeight, Math.min(event.clientY - offsetY, maxY));
        windowElement.style.left = `${x}px`;
        windowElement.style.top = `${y}px`;
    };

    const stop = () => {
        dragging = false;
        document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);

    const closeButton = windowElement.querySelector("#terminalClose, #ticTacToeClose, #memoryClose, .messages-close, .files-close, .browser-close, #gamesClose, .window-close");
    closeButton?.addEventListener("click", event => {
        event.stopPropagation();
        windowElement.remove();
    });

    const maximizeButton = windowElement.querySelector("#terminalMaximize");
    maximizeButton?.addEventListener("click", event => {
        event.stopPropagation();
        const maximized = windowElement.dataset.maximized === "true";

        if (!maximized) {
            const rect = windowElement.getBoundingClientRect();
            windowElement.dataset.oldLeft = `${rect.left}px`;
            windowElement.dataset.oldTop = `${rect.top}px`;
            windowElement.dataset.oldWidth = `${rect.width}px`;
            windowElement.dataset.oldHeight = `${rect.height}px`;
            windowElement.style.transform = "none";
            windowElement.style.left = "0";
            windowElement.style.top = "48px";
            windowElement.style.width = "100vw";
            windowElement.style.height = "calc(100vh - 48px)";
            windowElement.dataset.maximized = "true";
        } else {
            windowElement.style.left = windowElement.dataset.oldLeft;
            windowElement.style.top = windowElement.dataset.oldTop;
            windowElement.style.width = windowElement.dataset.oldWidth;
            windowElement.style.height = windowElement.dataset.oldHeight;
            windowElement.dataset.maximized = "false";
        }
    });

    windowElement.addEventListener("mousedown", () => {
        windowElement.style.zIndex = "3000";
    });
}

window.setupWindow = setupWindow;
