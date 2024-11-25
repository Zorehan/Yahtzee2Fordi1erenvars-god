
// Initialize dice results, whether the dice are held, remaining rolls, and the selected dice skin
let diceResults = [1, 1, 1, 1, 1];
let diceHeld = [false, false, false, false, false];
let rollsLeft = 3;
let diceSkin = "whiteDice";

// Function to simulate rolling a single die (returns a random number between 1 and 6)
function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
}

// Function to roll all dice that are not currently held
function rollDice() {
    if (rollsLeft > 0) { // Ensure rolls are available
        for (let i = 0; i < diceResults.length; i++) {
            if (!diceHeld[i]) { // Roll only the dice that are not held
                diceResults[i] = rollDie();
            }
        }
        updateDiceImages(); // Update the visual representation of the dice
        rollsLeft--; // Decrement the rolls left

        // Update the "Rolls left" text in the UI
        let rollsLeftText = document.getElementById("rollsLeftText");
        rollsLeftText.textContent = rollsLeft;
    }
}

// Function to set the dice skin to "blackDice" and update images
function onClickBlackDiceBtn() {
    diceSkin = "blackDice";
    updateDiceImages();
}

// Function to set the dice skin to "numberedDice3d" and update images
function onClickNumberedDiceBtn() {
    diceSkin = "numberedDice3d";
    updateDiceImages();
}

// Function to update the displayed dice images based on the current state
function updateDiceImages() {
    for (let i = 0; i < diceResults.length; i++) {
        let diceImage = document.getElementById(`dice${i + 1}`); // Select dice image by ID
        diceImage.src = `diceSetsFolder/${diceSkin}/dice-${diceResults[i]}.png`; // Set image based on dice skin and result

        // Add or remove the 'held' class based on whether the die is held
        if (diceHeld[i]) {
            diceImage.classList.add('held');
        } else {
            diceImage.classList.remove('held');
        }
    }
}

// Function to toggle whether a die is held (selected) based on its index
function selectDice(index) {
    if (rollsLeft != 3) { // Ensure at least one roll has occurred
        index = index - 1; // Adjust index to zero-based
        diceHeld[index] = !diceHeld[index]; // Toggle the held state of the die
        updateDiceImages(); // Update the dice images to reflect the new state
    }
}

// Function to enable relevant input fields based on the current dice roll
function checkValidFields() {
    if (rollsLeft < 3) { // Only enable fields if at least one roll has occurred
        document.querySelectorAll('input[type="number"]').forEach(field => {
            if (!field.classList.contains('held')) field.disabled = false; // Enable unheld fields
        });

        // Future logic for dynamically enabling fields could be added here
    }
}

// Function to set whether a specific input field is available for scoring
function setFieldAvailability(id, available) {
    let field = document.getElementById(id);
    field.disabled = !available; // Enable or disable the field
}

// Function to count the occurrences of each dice value in the current roll
function countDice(dice) {
    let counts = {};
    for (let die of dice) {
        counts[die] = (counts[die] || 0) + 1; // Increment the count for each die value
    }
    return counts;
}

// Function to update and display the total scores for upper and lower sections
function updateTotals() {
    let upperTotal = 0;
    let lowerTotal = 0;

    // Calculate the upper section total
    const upperFields = ['aces', 'twos', 'threes', 'fours', 'fives', 'sixes'];
    upperFields.forEach(id => {
        let field = document.getElementById(id);
        if (field.value !== '') {
            upperTotal += parseInt(field.value);
        }
    });

    // Calculate the lower section total
    const lowerFields = ['onePair', 'twoPairs', 'threeOfAKind', 'fourOfAKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yahtzee', 'chance'];
    lowerFields.forEach(id => {
        let field = document.getElementById(id);
        if (field.value !== '') {
            lowerTotal += parseInt(field.value);
        }
    });

    // Add a bonus if upper total is 63 or more
    if (upperTotal >= 63) {
        upperTotal += 50;
    }

    // Update the UI with the totals
    document.getElementById('upperTotal').innerText = upperTotal;
    document.getElementById('lowerTotal').innerText = lowerTotal;
    document.getElementById('totalScore').innerText = upperTotal + lowerTotal;
}

// Function to handle the "Roll Dice" button click
function rollButtonHandler() {
    rollDice(); // Roll the dice
    checkValidFields(); // Enable fields based on the roll
    updateScoreFields(); // Update score fields with possible scores
}

// Utility functions to calculate scores for specific categories
function numberOfCategory(dice, number) { /* Calculate total score for a specific number */ }
function onePair(dice) { /* Calculate score for one pair */ }
function twoPairs(dice) { /* Calculate score for two pairs */ }
function threeOfAKind(dice) { /* Calculate score for three of a kind */ }
function fourOfAKind(dice) { /* Calculate score for four of a kind */ }
function fullHouse(dice) { /* Calculate score for a full house */ }
function smallStraight(dice) { /* Check for and calculate score for a small straight */ }
function largeStraight(dice) { /* Check for and calculate score for a large straight */ }
function chance(dice) { /* Calculate total sum of dice for chance */ }
function yatzy(dice) { /* Check for and calculate score for Yahtzee */ }

// Function to dynamically update score fields with possible scores based on the current roll
function updateScoreFields() {
    document.querySelectorAll('input[type="number"]').forEach(field => {
        if (!field.classList.contains('held')) {
            let score = 0;
            const id = field.id;

            // Determine score for each category based on the field ID
            switch (id) {
                case 'aces': score = numberOfCategory(diceResults, 1); break;
                case 'twos': score = numberOfCategory(diceResults, 2); break;
                case 'threes': score = numberOfCategory(diceResults, 3); break;
                case 'fours': score = numberOfCategory(diceResults, 4); break;
                case 'fives': score = numberOfCategory(diceResults, 5); break;
                case 'sixes': score = numberOfCategory(diceResults, 6); break;
                case 'onePair': score = onePair(diceResults); break;
                case 'twoPairs': score = twoPairs(diceResults); break;
                case 'threeOfAKind': score = threeOfAKind(diceResults); break;
                case 'fourOfAKind': score = fourOfAKind(diceResults); break;
                case 'fullHouse': score = fullHouse(diceResults); break;
                case 'smallStraight': score = smallStraight(diceResults); break;
                case 'largeStraight': score = largeStraight(diceResults); break;
                case 'yahtzee': score = yatzy(diceResults); break;
                case 'chance': score = chance(diceResults); break;
            }

            field.value = score; // Set the calculated score in the field
        }
    });
}

// Reset input fields and game state after a score is submitted
function resetScoreFields() { /* Clear unheld input fields */ }
function resetGame() { /* Reset dice, rolls, and game state */ }


