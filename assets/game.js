let diceResults = [1, 1, 1, 1, 1];
let diceHeld = [false, false, false, false, false];
let rollsLeft = 3;
let diceSkin = 'whiteDice';

function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
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
}

function onClickBlackDiceBtn() {
    diceSkin = 'blackDice';
    updateDiceImages();
}

function onClickNumberedDiceBtn() {
    diceSkin = 'numberedDice3d';
    updateDiceImages();
}

function updateDiceImages() {
    for (let i = 0; i < diceResults.length; i++) {
        let diceImage = document.getElementById(`dice${i + 1}`);
        diceImage.src = `/diceSetsFolder/${diceSkin}/dice-${diceResults[i]}.png`;

        if (diceHeld[i]) {
            diceImage.classList.add('held');
        } else {
            diceImage.classList.remove('held');
        }
    }
}

function selectDice(index) {
    if (rollsLeft !== 3) {
        index = index - 1;
        diceHeld[index] = !diceHeld[index];
        updateDiceImages();
    }
}

function checkValidFields() {
    if (rollsLeft < 3) {
        document.querySelectorAll('input[type="number"]').forEach((field) => {
            if (!field.classList.contains('held')) field.disabled = false;
        });

        let counts = countDice(diceResults);

        // Upper Section
        setFieldAvailability('aces', numberOfCategory(diceResults, 1) > 0);
        setFieldAvailability('twos', numberOfCategory(diceResults, 2) > 0);
        setFieldAvailability('threes', numberOfCategory(diceResults, 3) > 0);
        setFieldAvailability('fours', numberOfCategory(diceResults, 4) > 0);
        setFieldAvailability('fives', numberOfCategory(diceResults, 5) > 0);
        setFieldAvailability('sixes', numberOfCategory(diceResults, 6) > 0);

        // Lower Section
        setFieldAvailability("onePair", onePair(diceResults) > 0);
        setFieldAvailability("twoPairs", twoPairs(diceResults) > 0);
        setFieldAvailability("threeOfAKind", threeOfAKind(diceResults) > 0);
        setFieldAvailability("fourOfAKind", fourOfAKind(diceResults) > 0);
        setFieldAvailability("fullHouse", fullHouse(diceResults) > 0);
        setFieldAvailability("smallStraight", smallStraight(diceResults) > 0);
        setFieldAvailability("largeStraight", largeStraight(diceResults) > 0);
        setFieldAvailability("yahtzee", yatzy(diceResults) > 0);
        setFieldAvailability("chance", true);
    }
}

function countDice(diceResults) {
    return diceResults.reduce((acc, die) => {
        acc[die] = (acc[die] || 0) + 1;
        return acc;
    }, {});
}

function onePair(dice) {
    const counts = countDice(dice);
    for (let i = 6; i > 0; i--) {
        if (counts[i] >= 2) {
            return i * 2;
        }
    }
    return 0;
}

function twoPairs(dice) {
    const counts = countDice(dice);
    let pairs = [];
    for (let i = 6; i > 0; i--) {
        if (counts[i] >= 2) {
            pairs.push(i);
            if (pairs.length === 2) {
                return pairs[0] * 2 + pairs[1] * 2;
            }
        }
    }
    return 0;
}

function threeOfAKind(dice) {
    const counts = countDice(dice);
    for (let i = 6; i > 0; i--) {
        if (counts[i] >= 3) {
            return i * 3;
        }
    }
    return 0;
}

function fourOfAKind(dice) {
    const counts = countDice(dice);
    for (let i = 6; i > 0; i--) {
        if (counts[i] >= 4) {
            return i * 4;
        }
    }
    return 0;
}

function fullHouse(dice) {
    const counts = countDice(dice);
    let three = 0, two = 0;
    for (let i = 6; i > 0; i--) {
        if (counts[i] === 3) {
            three = i;
        } else if (counts[i] === 2) {
            two = i;
        }
    }
    return (three && two) ? three * 3 + two * 2 : 0;
}

function smallStraight(dice) {
    const sorted = [...new Set(dice)].sort();
    return JSON.stringify(sorted) === JSON.stringify([1, 2, 3, 4, 5]) ? 15 : 0;
}

function largeStraight(dice) {
    const sorted = [...new Set(dice)].sort();
    return JSON.stringify(sorted) === JSON.stringify([2, 3, 4, 5, 6]) ? 20 : 0;
}

function chance(dice) {
    return dice.reduce((sum, die) => sum + die, 0);
}

function yatzy(dice) {
    return dice.every(die => die === dice[0]) ? 50 : 0;
}

function numberOfCategory(diceResults, category) {
    return diceResults.filter((die) => die === category).length;
}

function setFieldAvailability(fieldId, isAvailable) {
    let field = document.getElementById(fieldId);
    if (isAvailable) {
        field.disabled = false;
    } else {
        field.disabled = true;
    }
}

function updateGameState(category, score) {
    fetch('/api/update-score', {
        method: 'POST',
        body: JSON.stringify({ category, score }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
        });
}

function updateScoreFields(){
    document.querySelectorAll('input[type="number"]').forEach(field => {
        if(!field.classList.contains('held')){
            let score = 0;
            const id = field.id;


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

            field.value = score;
        }
    })
}
