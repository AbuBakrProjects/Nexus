let tttState = null;

function initializeTicTacToe() {
    const board = document.querySelectorAll("#ticTacToeWindow .ttt-box");
    const status = document.getElementById("tttStatus");
    const result = document.getElementById("tttResult");
    const reset = document.getElementById("tttReset");

    if (!board.length || !status || !result || !reset) return;

    if (tttState?.window === document.getElementById("ticTacToeWindow")) {
        return;
    }

    tttState = {
        window: document.getElementById("ticTacToeWindow"),
        board: Array(9).fill(null),
        over: false,
        player: "X",
        buttons: board
    };

    const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    function checkWinner(state) {
        for (const [a, b, c] of wins) {
            if (state[a] && state[a] === state[b] && state[a] === state[c]) {
                return [a, b, c];
            }
        }
        return null;
    }

    function endGame(winner, winningCells = []) {
        tttState.over = true;
        winningCells.forEach(index => tttState.buttons[index].classList.add("win"));
        result.textContent = winner === "X" ? "YOU WON • NOVA DEFEATED" : winner === "O" ? "NOVA WON • YOU WERE DEFEATED" : "DRAW • NEITHER OF YOU WON";
        winner ? (winner === "X" ? playSuccessSound?.() : playErrorSound?.()) : playClickSound?.();
        status.textContent = "ROUND COMPLETE";
        if (winner === "X") novaSay?.("Okay, okay. You got me. Nice move. I’ll pretend I meant to lose.", 6000, "game");
        else if (winner === "O") novaSay?.("Heh. I had a feeling you’d leave that opening. Rematch?", 6000, "game");
        else novaSay?.("A draw. Neither of us gets bragging rights this time.", 6000, "game");
        tttState.buttons.forEach(button => button.disabled = true);
    }

    function availableMoves() {
        return tttState.board.map((value, index) => value ? null : index).filter(index => index !== null);
    }

    function computerMove() {
        const moves = availableMoves();
        if (!moves.length || tttState.over) return;

        const winning = findTacticalMove("O");
        const blocking = findTacticalMove("X");
        const move = winning ?? blocking ?? (tttState.board[4] ? moves[Math.floor(Math.random() * moves.length)] : 4);
        play(move, "O");
    }

    function findTacticalMove(symbol) {
        for (const [a, b, c] of wins) {
            const cells = [tttState.board[a], tttState.board[b], tttState.board[c]];
            const mine = cells.filter(value => value === symbol).length;
            const empty = [a, b, c].find(index => !tttState.board[index]);
            if (mine === 2 && empty !== undefined) return empty;
        }
        return null;
    }

    function play(index, symbol) {
        if (tttState.over || tttState.board[index]) return;

        tttState.board[index] = symbol;
        tttState.buttons[index].textContent = symbol;
        playClickSound?.();
        tttState.buttons[index].disabled = true;

        const winningCells = checkWinner(tttState.board);
        if (winningCells) {
            endGame(symbol, winningCells);
            return;
        }

        if (tttState.board.every(Boolean)) {
            endGame(null);
            return;
        }

        if (symbol === "X") {
            status.textContent = "NOVA IS THINKING...";
            setTimeout(computerMove, 280);
        } else {
            status.textContent = "YOUR TURN • X";
        }
    }

    tttState.buttons.forEach(button => {
        button.addEventListener("click", () => play(Number(button.dataset.index), "X"));
    });

    reset.addEventListener("click", () => {
        tttState.board.fill(null);
        tttState.over = false;
        tttState.buttons.forEach(button => {
            button.textContent = "";
            button.disabled = false;
            button.classList.remove("win");
        });
        status.textContent = "YOUR TURN • X";
        result.textContent = "";
    });
}

window.initializeTicTacToe = initializeTicTacToe;
