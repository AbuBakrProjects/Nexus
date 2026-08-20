async function loadHTML(elementId, url) {
    const element =
        document.getElementById(elementId);

    if (!element) {
        console.error(`Missing element: #${elementId}`);
        return false;
    }

    try {
        const response =
            await fetch(url);

        if (!response.ok) {
            throw new Error(
                `${url} returned ${response.status}`
            );
        }

        element.innerHTML =
            await response.text();

        return true;

    } catch (error) {
        console.error(
            `Failed to load ${url}:`,
            error
        );

        return false;
    }
}

function updateClock() {
    const clock =
        document.getElementById("clock");

    if (!clock) {
        return;
    }

    const now =
        new Date();

    clock.textContent =
        `${String(now.getHours()).padStart(2, "0")}:` +
        `${String(now.getMinutes()).padStart(2, "0")}`;
}

function playMessageSound() {
    const sound =
        document.getElementById(
            "notificationSound"
        );

    if (!sound) {
        return;
    }

    sound.currentTime = 0;

    sound.play().catch(() => {
        const playSound =
            function () {
                sound.currentTime = 0;

                sound.play().catch(() => {});
            };

        document.addEventListener(
            "click",
            playSound,
            { once: true }
        );

        document.addEventListener(
            "keydown",
            playSound,
            { once: true }
        );
    });
}

function showNewMessageNotification(
    messageStage = 0
) {
    const container =
        document.getElementById(
            "notificationContainer"
        );

    const badge =
        document.getElementById(
            "messageBadge"
        );

    if (badge) {
        badge.classList.remove("hidden");
    }

    if (!container) {
        return;
    }

    const oldNotification =
        document.querySelector(
            ".system-notification"
        );

    if (oldNotification) {
        oldNotification.remove();
    }

    let preview =
        "You have a new message.";

    if (messageStage === 0) {
        preview =
            "If you're seeing this...";
    }

    if (messageStage === 1) {
        preview =
            "You found the part I was worried about.";
    }

    if (messageStage === 2) {
        preview =
            "So. Now you know.";
    }

    const notification =
        document.createElement("div");

    notification.className =
        "system-notification";

    notification.innerHTML = `
        <div class="notification-icon">✉</div>

        <div class="notification-text">

            <div class="notification-title">
                NEW MESSAGE
            </div>

            <div class="notification-from">
                UNKNOWN
            </div>

            <div class="notification-preview">
                ${preview}
            </div>

        </div>
    `;

    notification.addEventListener(
        "click",
        function () {
            notification.remove();

            openMessages();
        }
    );

    container.appendChild(
        notification
    );

    playMessageSound();

    setTimeout(
        function () {
            if (notification.parentElement) {
                notification.remove();
            }
        },
        7000
    );
}

async function openTerminal() {
    const existing =
        document.getElementById(
            "terminalWindow"
        );

    if (existing) {
        existing.style.zIndex = "3000";

        const input =
            document.getElementById(
                "commandInput"
            );

        if (input) {
            input.focus();
        }

        return;
    }

    try {
        const response =
            await fetch(
                "/apps/terminal"
            );

        if (!response.ok) {
            throw new Error(
                `Terminal returned ${response.status}`
            );
        }

        const html =
            await response.text();

        document.body.insertAdjacentHTML(
            "beforeend",
            html
        );

        const terminal =
            document.getElementById(
                "terminalWindow"
            );

        if (!terminal) {
            throw new Error(
                "terminalWindow was not created."
            );
        }

        setupWindow(terminal);

        initializeTerminal();

    } catch (error) {
        console.error(
            "Terminal failed to open:",
            error
        );
    }
}

async function openMessages() {
    const existing =
        document.getElementById(
            "messagesWindow"
        );

    if (existing) {
        existing.style.zIndex = "3000";

        await updateMessages();

        return;
    }

    try {
        const response =
            await fetch(
                "/apps/messages"
            );

        if (!response.ok) {
            throw new Error(
                `Messages returned ${response.status}`
            );
        }

        const html =
            await response.text();

        document.body.insertAdjacentHTML(
            "beforeend",
            html
        );

        const messagesWindow =
            document.getElementById(
                "messagesWindow"
            );

        if (!messagesWindow) {
            throw new Error(
                "messagesWindow was not created."
            );
        }

        setupWindow(
            messagesWindow
        );

        await updateMessages();

        const badge =
            document.getElementById(
                "messageBadge"
            );

        if (badge) {
            badge.classList.add("hidden");
        }

        const listBadge =
            document.getElementById(
                "messageListBadge"
            );

        if (listBadge) {
            listBadge.classList.add("hidden");
        }

    } catch (error) {
        console.error(
            "Messages failed to open:",
            error
        );
    }
}

async function openFiles() {
    const existing =
        document.getElementById(
            "filesWindow"
        );

    if (existing) {
        existing.style.zIndex = "3000";

        return;
    }

    try {
        const response =
            await fetch(
                "/apps/files"
            );

        if (!response.ok) {
            throw new Error(
                `Files returned ${response.status}`
            );
        }

        const html =
            await response.text();

        document.body.insertAdjacentHTML(
            "beforeend",
            html
        );

        const filesWindow =
            document.getElementById(
                "filesWindow"
            );

        if (!filesWindow) {
            throw new Error(
                "filesWindow was not created."
            );
        }

        setupWindow(
            filesWindow
        );

        if (
            typeof initializeFiles ===
            "function"
        ) {
            initializeFiles();
        }

    } catch (error) {
        console.error(
            "Files failed to open:",
            error
        );
    }
}

async function updateMessages() {
    try {
        const response =
            await fetch(
                "/api/messages"
            );

        if (!response.ok) {
            throw new Error(
                "Message API failed."
            );
        }

        const data =
            await response.json();

        const messageBody =
            document.querySelector(
                ".message-body"
            );

        const messagePreview =
            document.querySelector(
                ".message-preview"
            );

        if (!messageBody) {
            return;
        }

        if (data.challenge01_complete) {
            messageBody.textContent =
                `So.

Now you know.

192.168.1.44 wasn't NEXUS.

Someone else was connecting to this machine.

And they tried three times
before they got in.

That's the part that bothers me.

But there's something else.

I need you to find out
what happened at 03:17.

Don't open the system log yet.

There's another way in.

I'll contact you again.

— UNKNOWN`;

            if (messagePreview) {
                messagePreview.textContent =
                    "So. Now you know.";
            }

        } else if (data.access_log_found) {
            messageBody.textContent =
                `You found the part I was worried about.

192.168.1.44

Don't assume it's an intruder yet.

That's the mistake people make.

An unfamiliar address isn't proof of anything.

We need something to compare it with.

Find out what address belongs to NEXUS itself.

You won't find the answer in the access log.

Look through the system configuration.

Start with:

/etc

If you're not familiar with the terminal,
ask NOVA.

She'll keep you from getting lost.

— UNKNOWN`;

            if (messagePreview) {
                messagePreview.textContent =
                    "You found the part I was worried about.";
            }

        } else {
            messageBody.textContent =
                `If you're seeing this, then NEXUS came back online.

It wasn't supposed to.

The last shutdown was recorded.

The restart wasn't.

I don't know how long you've been connected,
so I'm going to keep this short.

Don't trust what the desktop tells you.

Something happened before you arrived.

There are traces of it all over this machine.

Logs.
Connections.
Old system files.

Start by looking around.

If you know how to use the terminal,
you already know where to begin.

If you don't...

That's okay.

Open it.

I'll tell you what you need to know when you need it.

— UNKNOWN`;

            if (messagePreview) {
                messagePreview.textContent =
                    "Open it.";
            }
        }

    } catch (error) {
        console.error(
            "Could not update messages:",
            error
        );
    }
}

document.addEventListener(
    "click",
    function (event) {

        if (
            event.target.closest(
                "#terminalButton"
            ) ||
            event.target.closest(
                "#terminalDesktopIcon"
            )
        ) {
            openTerminal();

            return;
        }

        if (
            event.target.closest(
                "#messagesButton"
            ) ||
            event.target.closest(
                "#messagesIcon"
            )
        ) {
            openMessages();

            return;
        }

        if (
            event.target.closest(
                "#filesIcon"
            )
        ) {
            openFiles();

            return;
        }
    }
);

async function startDesktop() {
    const panelLoaded =
        await loadHTML(
            "panel",
            "/panel"
        );

    const desktopLoaded =
        await loadHTML(
            "desktop",
            "/desktop"
        );

    if (!panelLoaded || !desktopLoaded) {
        console.error(
            "Desktop failed to initialize."
        );

        return;
    }

    updateClock();
}

startDesktop();

setInterval(
    updateClock,
    1000
);