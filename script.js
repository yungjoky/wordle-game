const WORD_LENGTH = 5;
const TRIES = 6;
const KEYBOARD_LETTERS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
];

// Update the fetchRandomWord function to use a better API
async function fetchRandomWord() {
    try {
        const response = await fetch('https://random-word-api.herokuapp.com/word?length=5');
        const words = await response.json();
        const word = words[0].toUpperCase();
        
        if (/^[A-Z]+$/.test(word)) {
            return word;
        }
        return fetchRandomWord();
    } catch (error) {
        console.error('Error fetching word:', error);
        const fallbackWords = ['WORLD', 'LIGHT', 'BREAD', 'DREAM', 'SHINE', 'BEACH'];
        return fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
    }
}

// Initialize the game board
function initBoard() {
    const gameBoard = document.getElementById('game-board');
    for (let i = 0; i < TRIES; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            row.appendChild(tile);
        }
        gameBoard.appendChild(row);
    }
}

// Initialize the keyboard
function initKeyboard() {
    const keyboard = document.getElementById('keyboard');
    KEYBOARD_LETTERS.forEach(row => {
        const keyboardRow = document.createElement('div');
        keyboardRow.className = 'keyboard-row';
        row.forEach(letter => {
            const key = document.createElement('button');
            key.textContent = letter;
            key.className = 'key';
            key.addEventListener('click', () => handleKeyClick(letter));
            keyboardRow.appendChild(key);
        });
        keyboard.appendChild(keyboardRow);
    });
}

function handleKeyClick(key) {
    if (isGameOver) return;
    
    if (key === '⌫') {
        deleteLetter();
    } else if (key === 'Enter') {
        checkRow();
    } else if (currentTile < WORD_LENGTH && currentRow < TRIES) {
        addLetter(key);
    }
}

function addLetter(letter) {
    const row = document.querySelector('.row:nth-child(' + (currentRow + 1) + ')');
    const tile = row.querySelector(`.tile:nth-child(${currentTile + 1})`);
    tile.textContent = letter;
    tile.classList.add('filled');
    currentTile++;
}

function deleteLetter() {
    if (currentTile > 0) {
        currentTile--;
        const row = document.querySelector('.row:nth-child(' + (currentRow + 1) + ')');
        const tile = row.querySelector(`.tile:nth-child(${currentTile + 1})`);
        tile.textContent = '';
        tile.classList.remove('filled');
    }
}

function checkRow() {
    if (currentTile !== WORD_LENGTH) return;

    const row = document.querySelector(`.row:nth-child(${currentRow + 1})`);
    const guess = Array.from(row.children).map(tile => tile.textContent).join('');
    const tiles = row.children;

    if (guess === targetWord) {
        colorize(tiles, guess);
        isGameOver = true;
        showMessage('Magnificent!', true);
        return;
    }

    colorize(tiles, guess);

    if (currentRow === TRIES - 1) {
        isGameOver = true;
        showMessage(`Game Over! The word was ${targetWord}`, true);
        return;
    }

    currentRow++;
    currentTile = 0;
}

function colorize(tiles, guess) {
    const letterCount = {};
    for (let i = 0; i < targetWord.length; i++) {
        letterCount[targetWord[i]] = (letterCount[targetWord[i]] || 0) + 1;
    }

    // First pass: mark correct letters
    tiles.forEach((tile, index) => {
        const letter = tile.textContent;
        if (letter === targetWord[index]) {
            tile.classList.add('correct');
            letterCount[letter]--;
            updateKeyboardKey(letter, 'correct');
        }
    });

    // Second pass: mark wrong position and wrong letters
    tiles.forEach((tile, index) => {
        const letter = tile.textContent;
        if (!tile.classList.contains('correct')) {
            if (letterCount[letter] > 0) {
                tile.classList.add('wrong-position');
                letterCount[letter]--;
                updateKeyboardKey(letter, 'wrong-position');
            } else {
                tile.classList.add('wrong');
                updateKeyboardKey(letter, 'wrong');
            }
        }
    });
}

function updateKeyboardKey(letter, status) {
    const key = document.querySelector(`.key:not(.correct):not(.wrong-position)[data-key="${letter}"]`);
    if (key && !key.classList.contains('correct')) {
        key.classList.add(status);
    }
}

// Update showMessage to use English text
function showMessage(text, permanent = false) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.style.display = 'block';
    
    if (!permanent) {
        setTimeout(() => {
            message.style.display = 'none';
        }, 3000);
    }

    if (isGameOver) {
        const replayButton = document.createElement('button');
        replayButton.textContent = 'Play Again';
        replayButton.className = 'replay-button';
        replayButton.onclick = resetGame;
        message.appendChild(replayButton);
    }
}

// Add reset game function
async function resetGame() {
    // Clear the board
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    // Reset variables
    currentRow = 0;
    currentTile = 0;
    isGameOver = false;
    
    // Clear message
    const message = document.getElementById('message');
    message.style.display = 'none';
    message.innerHTML = '';
    
    // Reset keyboard
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';
    
    // Get new word and reinitialize
    targetWord = await fetchRandomWord();
    initBoard();
    initKeyboard();
}

document.addEventListener('keydown', (e) => {
    if (isGameOver) return;

    if (e.key === 'Backspace') {
        deleteLetter();
    } else if (e.key === 'Enter') {
        checkRow();
    } else if (e.key.match(/^[a-zA-Z]$/)) {
        const letter = e.key.toUpperCase();
        if (currentTile < WORD_LENGTH && currentRow < TRIES) {
            addLetter(letter);
        }
    }
});

// Replace the initialization at the bottom of your script with:
async function initGame() {
    targetWord = await fetchRandomWord();
    initBoard();
    initKeyboard();
}

// Start the game
initGame();