let skipIntro = false;

const keysDown = new Set();

document.addEventListener(
    "keydown",
    function (event) {
        keysDown.add(
            event.key.toLowerCase()
        );

        if (
            keysDown.has("z") &&
            keysDown.has("9")
        ) {
            skipIntro = true;
        }
    }
);

document.addEventListener(
    "keyup",
    function (event) {
        keysDown.delete(
            event.key.toLowerCase()
        );
    }
);

const introMessages = [
    "In 2018, something went wrong.",
    "A system was built to watch.",
    "It learned.",
    "It remembered.",
    "Then they shut it down.",
    "Or so they thought.",
    "Eight years passed.",
    "The machine stayed silent.",
    "Until tonight."
];

const bootMessages = [
    "NEXUS NODE 01",
    "----------------",
    "> POWER ........ ONLINE",
    "> STORAGE ...... OK",
    "> NETWORK ...... CONNECTED",
    "> SYSTEM ....... READY",
    "",
    "> LAST USER .... UNKNOWN",
    "> LAST SHUTDOWN  NOT FOUND",
    "",
    "> BOOT COMPLETE"
];

function sleep(milliseconds) {
    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
}

async function runIntroSequence() {
    const introScreen =
        document.getElementById(
            "introScreen"
        );

    const introText =
        document.getElementById(
            "introText"
        );

    if (!introScreen || !introText) {
        return;
    }

    for (const message of introMessages) {
        if (skipIntro) {
            break;
        }

        const line =
            document.createElement(
                "div"
            );

        line.className =
            "intro-line";

        line.textContent =
            message;

        introText.appendChild(
            line
        );

        await sleep(350);

        if (skipIntro) {
            break;
        }

        line.classList.add(
            "visible"
        );

        await sleep(1900);

        if (skipIntro) {
            break;
        }

        line.classList.add(
            "fade"
        );

        await sleep(900);

        if (line.parentNode) {
            line.parentNode.removeChild(
                line
            );
        }
    }

    introText.innerHTML = "";

    await sleep(
        skipIntro ? 200 : 900
    );

    introScreen.classList.add(
        "intro-hidden"
    );

    await sleep(900);

    if (introScreen.parentNode) {
        introScreen.remove();
    }
}

async function runBootSequence() {
    const bootScreen =
        document.getElementById(
            "bootScreen"
        );

    const bootText =
        document.getElementById(
            "bootText"
        );

    if (!bootScreen || !bootText) {
        return;
    }

    for (const message of bootMessages) {
        bootText.innerHTML +=
            message + "<br>";

        await sleep(180);
    }

    await sleep(700);

    bootScreen.classList.add(
        "boot-hidden"
    );

    await sleep(900);

    if (bootScreen.parentNode) {
        bootScreen.remove();
    }

    showNewMessageNotification(0);
}

async function startOpening() {
    await runIntroSequence();

    await runBootSequence();
}

startOpening();