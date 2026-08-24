async function openGameWindow(url, id, initialize) {
    const existing = document.getElementById(id);
    if (existing) {
        existing.style.display = "block";
        existing.style.zIndex = "3000";
        initialize?.(existing);
        return;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url} returned ${response.status}`);
    document.body.insertAdjacentHTML("beforeend", await response.text());
    const windowElement = document.getElementById(id);
    if (!windowElement) throw new Error(`${id} was not created.`);
    setupWindow(windowElement);
    windowElement.style.display = "block";
    windowElement.style.zIndex = "3000";
    initialize?.(windowElement);
}

function openGames() {
    const existing = document.getElementById("gamesWindow");
    if (existing) {
        existing.style.zIndex = "3000";
        return;
    }
    fetch("/apps/games")
        .then(response => {
            if (!response.ok) throw new Error(`Games returned ${response.status}`);
            return response.text();
        })
        .then(html => {
            document.body.insertAdjacentHTML("beforeend", html);
            setupWindow(document.getElementById("gamesWindow"));
        })
        .catch(error => console.error("Games failed to open:", error));
}

function openTicTacToe() {
    openGameWindow("/apps/games/tictactoe", "ticTacToeWindow", initializeTicTacToe).catch(error => console.error("Tic Tac Toe failed to open:", error));
}

function openMemoryGame() {
    openGameWindow("/apps/games/memory", "memoryWindow", initializeMemoryGame).catch(error => console.error("Memory game failed to open:", error));
}

document.addEventListener("click", event => {
    const gameButton = event.target.closest("[data-game]");
    if (!gameButton) return;
    if (gameButton.dataset.game === "tictactoe") openTicTacToe();
    if (gameButton.dataset.game === "memory") openMemoryGame();
});

window.openGames = openGames;
window.openTicTacToe = openTicTacToe;
window.openMemoryGame = openMemoryGame;
