let memoryState = null;

function initializeMemoryGame() {
    const board = document.getElementById("memoryBoard");
    const status = document.getElementById("memoryStatus");
    const result = document.getElementById("memoryResult");
    const reset = document.getElementById("memoryReset");

    if (!board || !status || !result || !reset) return;

    const symbols = ["◈", "◆", "◇", "●", "◉", "△", "□", "※"];
    let cards = [];
    let first = null;
    let second = null;
    let locked = false;
    let matches = 0;

    function start() {
        cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
        first = null;
        second = null;
        locked = false;
        matches = 0;
        result.textContent = "";
        status.textContent = "MATCH THE TRACES • 0/8";
        board.innerHTML = "";

        cards.forEach((symbol, index) => {
            const card = document.createElement("button");
            card.className = "memory-card";
            card.dataset.index = index;
            card.textContent = symbol;
            card.setAttribute("aria-label", "Hidden memory card");
            card.addEventListener("click", () => reveal(card));
            board.appendChild(card);
        });
    }

    function reveal(card) {
        if (locked || card.classList.contains("revealed") || card.classList.contains("matched")) return;

        card.classList.add("revealed");

        if (!first) {
            first = card;
            return;
        }

        second = card;
        locked = true;

        if (cards[first.dataset.index] === cards[second.dataset.index]) {
            first.classList.add("matched");
            second.classList.add("matched");
            matches++;
            playSuccessSound?.();
            status.textContent = `MATCH THE TRACES • ${matches}/8`;
            first = null;
            second = null;
            locked = false;

            if (matches === 8) {
                result.textContent = "YOU WON • ALL TRACES RECOVERED";
                playSuccessSound?.();
                status.textContent = "NEXUS MEMORY COMPLETE";
                novaSay?.("You recovered every trace. Not bad, explorer.", 6000, "game");
            }
            return;
        }

        playErrorSound?.();
        setTimeout(() => {
            first.classList.remove("revealed");
            second.classList.remove("revealed");
            first = null;
            second = null;
            locked = false;
        }, 650);
    }

    reset.onclick = start;
    memoryState = { start };
    start();
}

window.initializeMemoryGame = initializeMemoryGame;
