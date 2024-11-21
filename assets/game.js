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


function updateGameState(gameState) {
    document.getElementById('rollsLeftText').textContent = gameState.rollsLeft;

    for (let i = 0; i < 5; i++) {
        const die = document.getElementById(`dice${i + 1}`);
        die.src = `/diceSetsFolder/${gameState.diceSkin}/dice-${gameState.diceResults[i]}.png`;
        console.log(die.src)
        if (gameState.diceHeld[i]) {
            die.classList.add('held');
        } else {
            die.classList.remove('held');
        }
    }

    document.getElementById('aces').value = gameState.scores.aces;
    document.getElementById('twos').value = gameState.scores.twos;
    document.getElementById('threes').value = gameState.scores.threes;
    document.getElementById("fours").value = gameState.scores.fours;
    document.getElementById("fives").values = gameState.scores.fives;
    document.getElementById("sixes").values = gameState.scores.fives;
    document.getElementById("onePair").values = gameState.scores.fives;
    document.getElementById("twoPairs").values = gameState.scores.fives;
    document.getElementById("threeOfAKind").values = gameState.scores.fives;
    document.getElementById("fourOfAKind").values = gameState.scores.fives;
    document.getElementById("fullHouse").values = gameState.scores.fives;
    document.getElementById("smallStraight").values = gameState.scores.fives;
    document.getElementById("largeStraight").values = gameState.scores.fives;
    document.getElementById("yahtzee").values = gameState.scores.fives;
    document.getElementById("chance").values = gameState.scores.fives;
    document.getElementById('upperTotal').textContent = gameState.upperTotal;
    document.getElementById('lowerTotal').textContent = gameState.lowerTotal;
    document.getElementById('totalScore').textContent = gameState.totalScore;
}