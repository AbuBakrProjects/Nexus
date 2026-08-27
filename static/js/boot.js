document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;
window.scrollTo(0, 0);
document.body.classList.add("nexus-booting");

let skipIntro = false;
const keysDown = new Set();
document.addEventListener("keydown", event => { keysDown.add(event.key.toLowerCase()); if (keysDown.has("z") && keysDown.has("9")) skipIntro = true; });
document.addEventListener("keyup", event => keysDown.delete(event.key.toLowerCase()));
document.querySelectorAll(".skip-hint").forEach(button => button.addEventListener("click", () => { skipIntro = true; }));
const introMessages = ["In 2018, something went wrong.", "A system was built to watch.", "It learned.", "It remembered.", "Then they shut it down.", "Or so they thought.", "Eight years passed.", "The machine stayed silent.", "Until tonight."];
const bootMessages = [
    { text: "NEXUS NODE 01", className: "boot-title" },
    { text: "----------------", className: "boot-node" },
    { text: "> POWER ........ ONLINE", className: "boot-system" },
    { text: "> MEMORY ....... CHECK OK", className: "boot-system" },
    { text: "> STORAGE ...... CHECK OK", className: "boot-system" },
    { text: "> NETWORK ...... INTERFACE READY", className: "boot-system" },
    { text: "> NEXUS LINK ... ESTABLISHED", className: "boot-system" },
    { text: "> USER SESSION . UNKNOWN", className: "boot-warning" },
    { text: "> LAST SHUTDOWN  RECORDED", className: "boot-warning" },
    { text: "> RESTART ...... UNEXPECTED", className: "boot-warning" },
    { text: "", className: "boot-system" },
    { text: "> BOOT COMPLETE", className: "boot-node" }
];
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
async function runIntroSequence() {
    const introScreen = document.getElementById("introScreen");
    const introText = document.getElementById("introText");
    if (!introScreen || !introText) return;
    for (const message of introMessages) {
        if (skipIntro) break;
        const line = document.createElement("div");
        line.className = "intro-line";
        line.textContent = message;
        introText.appendChild(line);
        await sleep(350);
        if (skipIntro) break;
        line.classList.add("visible");
        await sleep(1900);
        if (skipIntro) break;
        line.classList.add("fade");
        await sleep(900);
        line.remove();
    }
    introText.innerHTML = "";
    await sleep(skipIntro ? 100 : 700);
    introScreen.classList.add("intro-hidden");
    await sleep(800);
    introScreen.remove();
}
async function runBootSequence() {
    const bootScreen = document.getElementById("bootScreen");
    const bootText = document.getElementById("bootText");
    if (!bootScreen || !bootText) return;
    playSound?.("bootSound");
    for (const message of bootMessages) {
        const line = document.createElement("div");
        line.className = `boot-line ${message.className || ""}`;
        line.textContent = message.text;
        bootText.appendChild(line);
        await sleep(skipIntro ? 20 : 150);
    }
    await sleep(skipIntro ? 100 : 600);
    bootScreen.classList.add("boot-hidden");
    await sleep(700);
    bootScreen.remove();
    document.body.classList.remove("nexus-booting");
    showNewMessageNotification?.(0);
    initializeNova?.().then(() => novaProgress?.());
}
async function startOpening() { await runIntroSequence(); await runBootSequence(); }
startOpening();
