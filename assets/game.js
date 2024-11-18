function rollButtonHandler() {
    fetch('/api/roll', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            updateGameState(data);
        })
        .catch(error => console.error('Error rolling dice:', error));
}

// Select Dice (Hold) handler (API interaction)
function selectDice(index) {
    fetch('/api/select-dice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ index: index })
    })
        .then(response => response.json())
        .then(data => {
            updateGameState(data);
        })
        .catch(error => console.error('Error selecting dice:', error));
}

// Change Dice Skin (API interaction)
function onClickBlackDiceBtn() {
    fetch('/api/change-skin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skin: 'blackDice' })
    })
        .then(response => response.json())
        .then(data => {
            updateGameState(data);
        })
        .catch(error => console.error('Error changing dice skin:', error));
}

function onClickNumberedDiceBtn() {
    fetch('/api/change-skin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skin: 'numberedDice3d' })
    })
        .then(response => response.json())
        .then(data => {
            updateGameState(data);
        })
        .catch(error => console.error('Error changing dice skin:', error));
}

// Update game state based on the API response
function updateGameState(gameState) {
    // Update the number of rolls left
    document.getElementById('rollsLeftText').textContent = gameState.rollsLeft;

    // Update dice images
    for (let i = 0; i < 5; i++) {
        const die = document.getElementById(`dice${i + 1}`);
        die.src = `/assets/diceSetsFolder/${gameState.diceSkin}/dice-${gameState.diceResults[i]}.png`;
        if (gameState.diceHeld[i]) {
            die.classList.add('held');
        } else {
            die.classList.remove('held');
        }
    }

    // Update scores (example for Aces)
    document.getElementById('aces').value = gameState.scores.aces;
    document.getElementById('twos').value = gameState.scores.twos;
    document.getElementById('threes').value = gameState.scores.threes;
    // Repeat for all other score categories...

    // Update the totals
    document.getElementById('upperTotal').textContent = gameState.upperTotal;
    document.getElementById('lowerTotal').textContent = gameState.lowerTotal;
    document.getElementById('totalScore').textContent = gameState.totalScore;
}