


function rollDie() {
    return  ;
}

function rollDice() {
    if (rollsLeft > 0) {
        for (let i = 0; i < diceResults.length; i++) {
            if (!diceHeld[i]) {
                diceResults[i] = rollDie();
            }
        }
        updateDiceImages();
        rollsLeft--;
        checkValidFields();
        updateScoreFields();

        let rollsLeftText = document.getElementById('rollsLeftText');
        rollsLeftText.textContent = rollsLeft;
    }
    return dice
}

function updateDiceImages(diceResults, diceSkin) {
    for (let i = 0; i < diceResults.length; i++) {
        let diceImage = document.getElementById(`dice${i + 1}`);
        diceImage.src = `/images/diceSetsFolder/${diceSkin}/dice-${diceResults[i]}.png`;

        if (diceHeld[i]) {
            diceImage.classList.add('held');
        } else {
            diceImage.classList.remove('held');
        }
    }
}