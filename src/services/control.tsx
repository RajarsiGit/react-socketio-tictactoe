const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const checkWinLoss = (buttonState: string[][]): { win: boolean, symbol: string } => {
    const gameState = new Array<string>(9);
    let i = 0, j = 0, k = 0;
    while (i < 3) {
        j = 0;
        while (j < 3) {
            gameState[k++] = buttonState[i][j++];
        }
        i++;
    }
    return handleResultValidation(gameState);
}

const handleResultValidation = (gameState: string[]): { win: boolean, symbol: string } => {
    for (let i = 0; i <= 7; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        if (a === '-' || b === '-' || c === '-') {
            continue;
        }
        if (a === b && b === c) {
            return {
                win: true,
                symbol: a
            }
        }
    }
    return {
        win: false,
        symbol: '-'
    }
}

export {
    checkWinLoss
}