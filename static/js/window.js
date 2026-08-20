function setupWindow(windowElement) {
    if (!windowElement) {
        return;
    }

    const titlebar =
        windowElement.querySelector(
            ".terminal-titlebar, .messages-titlebar, .files-titlebar"
        );

    if (!titlebar) {
        console.error("Window titlebar not found.");
        return;
    }

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    titlebar.addEventListener(
        "mousedown",
        function (event) {

            if (event.target.closest("button, input")) {
                return;
            }

            if (windowElement.dataset.maximized === "true") {
                return;
            }

            dragging = true;

            const rect =
                windowElement.getBoundingClientRect();

            offsetX =
                event.clientX - rect.left;

            offsetY =
                event.clientY - rect.top;

            windowElement.style.transform = "none";

            windowElement.style.left =
                `${rect.left}px`;

            windowElement.style.top =
                `${rect.top}px`;

            windowElement.style.zIndex = "3000";

            document.body.style.userSelect = "none";
        }
    );

    document.addEventListener(
        "mousemove",
        function (event) {

            if (!dragging) {
                return;
            }

            let x =
                event.clientX - offsetX;

            let y =
                event.clientY - offsetY;

            const panel =
                document.getElementById("panel");

            const panelHeight =
                panel
                    ? panel.offsetHeight
                    : 48;

            const maxX =
                window.innerWidth -
                windowElement.offsetWidth;

            const maxY =
                window.innerHeight -
                windowElement.offsetHeight;

            x = Math.max(
                0,
                Math.min(x, maxX)
            );

            y = Math.max(
                panelHeight,
                Math.min(y, maxY)
            );

            windowElement.style.left =
                `${x}px`;

            windowElement.style.top =
                `${y}px`;
        }
    );

    document.addEventListener(
        "mouseup",
        function () {

            if (!dragging) {
                return;
            }

            dragging = false;

            document.body.style.userSelect = "";
        }
    );

    const closeButton =
        windowElement.querySelector(
            "#terminalClose, .messages-close, #filesClose"
        );

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                windowElement.remove();

            }
        );
    }

    const maximizeButton =
        windowElement.querySelector(
            "#terminalMaximize"
        );

    if (maximizeButton) {

        maximizeButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                const maximized =
                    windowElement.dataset.maximized === "true";

                if (!maximized) {

                    const rect =
                        windowElement.getBoundingClientRect();

                    windowElement.dataset.oldLeft =
                        `${rect.left}px`;

                    windowElement.dataset.oldTop =
                        `${rect.top}px`;

                    windowElement.dataset.oldWidth =
                        `${rect.width}px`;

                    windowElement.dataset.oldHeight =
                        `${rect.height}px`;

                    windowElement.style.transform =
                        "none";

                    windowElement.style.left =
                        "0px";

                    windowElement.style.top =
                        "48px";

                    windowElement.style.width =
                        "100vw";

                    windowElement.style.height =
                        "calc(100vh - 48px)";

                    windowElement.dataset.maximized =
                        "true";

                } else {

                    windowElement.style.left =
                        windowElement.dataset.oldLeft;

                    windowElement.style.top =
                        windowElement.dataset.oldTop;

                    windowElement.style.width =
                        windowElement.dataset.oldWidth;

                    windowElement.style.height =
                        windowElement.dataset.oldHeight;

                    windowElement.dataset.maximized =
                        "false";
                }

            }
        );
    }

    windowElement.addEventListener(
        "mousedown",
        function () {

            const currentZ =
                parseInt(
                    windowElement.style.zIndex || "500",
                    10
                );

            if (currentZ < 3000) {
                windowElement.style.zIndex = "3000";
            }

        }
    );
}


window.setupWindow = setupWindow;
