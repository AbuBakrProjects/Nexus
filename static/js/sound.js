const SOUND_IDS = {
    boot: "bootSound",
    click: "clickSound",
    notification: "notificationSound",
    open: "openSound",
    success: "successSound",
    error: "errorSound",
    key: "keySound"
};

function playSound(id) {
    const sound = document.getElementById(id);

    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch(() => {});
}

function playClickSound() {
    playSound(SOUND_IDS.click);
}

function playOpenSound() {
    playSound(SOUND_IDS.open);
}

function playSuccessSound() {
    playSound(SOUND_IDS.success);
}

function playErrorSound() {
    playSound(SOUND_IDS.error);
}

function playKeySound() {
    playSound(SOUND_IDS.key);
}

window.playSound = playSound;
window.playClickSound = playClickSound;
window.playOpenSound = playOpenSound;
window.playSuccessSound = playSuccessSound;
window.playErrorSound = playErrorSound;
window.playKeySound = playKeySound;
