let diceResults = [1, 1, 1, 1, 1];
let diceHeld = [false, false, false, false, false];
let rollsLeft = 3;
let diceSkin = 'whiteDice';

function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
}


//Rolldice metoden er det som pugfilen kalder som sin onClick når der bliver trykket på "Roll" knappen
function rollDice() {
    if (rollsLeft > 0) {
        for (let i = 0; i < diceResults.length; i++) {
            if (!diceHeld[i]) {
                diceResults[i] = rollDie();
            }
        }
        //Denne her metode opdaterer billederne så det passser med de nye værdier der er blevet rullet
        updateDiceImages();

        rollsLeft--;
        //Vores all around check metode for at se hvilke felter spilleren evt. kunne plotte værdierne ind i
        checkValidFields();
        //Denne her metode opdateren de valide felter med de værdier det ville ende med at give hvis spilleren valgte at plotte sin slag ind
        updateScoreFields();

        let rollsLeftText = document.getElementById('rollsLeftText');
        rollsLeftText.textContent = rollsLeft;
    }
}

/*
Metoden går ind og tjekker diceresults variablen hvilket bliver opdateret hver gang et nyt slag sker,
herefter sætter den hver ternings billede til at stemme med hvadend værdi den endt med at blive
 */
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

//selectDice metoden bliver kaldt når man trykker på en af terningbillederne i webappen, den sætter bare terningen trykket på inde i et array så vi kan huske på at den ikke skal rerolles
function selectDice(index) {
    if (rollsLeft !== 3) {
        index = index - 1;
        diceHeld[index] = !diceHeld[index];
        updateDiceImages();
    }
}

/*
checkvalidFields metoden er en samling af alle vores checkMetoder som ser om ens slag ville kunne bruges til noget på sit pointbræt
en eksempel på hvordan det fungerer kunne være linje 69: vi kalder setFieldAvailablity på field aces hvilket er etternes inputfelt i pugfilen
herefter kalder vi numberOfCategory som returner om et givet diceRoll stemmer overens med en sammenligning baseret på om den er mere eller mindre end target-værdien
Hvis ja, så sætter vi fieldavailablity til true, hvis nej lader vi den ligge på false (da baseline er false for alle fields)
 */
function checkValidFields() {
    if (rollsLeft < 3) {
        document.querySelectorAll('input[type="number"]').forEach((field) => {
            if (!field.classList.contains('held')) field.disabled = false;
        });

        setFieldAvailability('aces', numberOfCategory(diceResults, 1) > 0);
        setFieldAvailability('twos', numberOfCategory(diceResults, 2) > 0);
        setFieldAvailability('threes', numberOfCategory(diceResults, 3) > 0);
        setFieldAvailability('fours', numberOfCategory(diceResults, 4) > 0);
        setFieldAvailability('fives', numberOfCategory(diceResults, 5) > 0);
        setFieldAvailability('sixes', numberOfCategory(diceResults, 6) > 0);

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

//fra linje 91 indtil line 176 har vi alle hjælpemetoderne som der bliver brugt i checkValidFields metoden, de følger allesammen den samme opskrift af:
// De får et diceinput som der bliver brugt til at finde frem til om terningerne opnår en bestemt condition (f.eks full house eller straight) og returner enten 0/1 alt efter om det er sandt eller falsk
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

//SetFieldavailability metoden bliver brugt til at gøre koden i checkValidFields kortere ved at enkapsulere logikken et andet sted. Den får 2 parametre med, et fieldID, som den skal finde i pugefilen
// og en boolean isAvailable som den bruger til at bestemme om fieldet skal være slukket eller ej
function setFieldAvailability(fieldId, isAvailable) {
    let field = document.getElementById(fieldId);
    if (isAvailable) {
        field.disabled = false;
    } else {
        field.disabled = true;
    }
}


//Update gamestate er stedet vi laver vores temporary gamestate til en permanent en ved at at sende den til endpointet der holder styr på dem på server-siden
function updateGameState(category, score) {
    fetch('/api/update-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, score }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                console.log('Score updated successfully:', data.gameState);
            } else {
                console.error('Error updating score:', data.message);
            }
        });
}

//Metoden står for at opdatere værdierne i de forskellige inputfelter ved hvert slag, iden er at bruge metoderne fra line 91-176 til at beregne hvilken værdi de forskellige felter skal have og derefter opdatere dem
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

//Bliver brugt til at resette alle felter der ikke er i "held" listen til 0 så man ikke kan plotte sit tidligere slag ind på sin næste tur
function resetScoreFields(){
    document.querySelectorAll('input[type="number"]').forEach(field => {
        if(!field.classList.contains('held')){
            field.value = ""
        }

    })
}
//Den her listener lytter på de forskkelige inputfelter på brættet, og ligeså snart en af dem bliver trykket, gemmer den værdien som spilleren har plottet ind, sender det til serveren, og afslutter turn
document.querySelectorAll('input[type="number"]').forEach(field => {
    field.addEventListener('click', function() {
        if (rollsLeft < 3 && !this.disabled) {
            this.classList.add('held')
            this.disabled = true;

            resetScoreFields()
            updateTotals();
            endTurn();
        }
    });
});
//Opdateter totals, hvilket lige nu er ubrugeligt da der ikke er totals lige nu
function updateTotals() {
    let upperTotal = 0;
    let lowerTotal = 0;

    const upperFields = ['aces', 'twos', 'threes', 'fours', 'fives', 'sixes'];
    upperFields.forEach(id => {
        let field = document.getElementById(id);
        if (field.value !== '') {
            upperTotal += parseInt(field.value);
        }
    });

    const lowerFields = ['onePair', 'twoPairs', 'threeOfAKind', 'fourOfAKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yahtzee', 'chance'];
    lowerFields.forEach(id => {
        let field = document.getElementById(id);
        if (field.value !== '') {
            lowerTotal += parseInt(field.value);
        }
    });

    if(upperTotal >= 63){
        upperTotal += 50
    }
    document.getElementById('upperTotal').innerText = upperTotal;
    document.getElementById('lowerTotal').innerText = lowerTotal;

    document.getElementById('totalScore').innerText = upperTotal + lowerTotal;

}
//EndTurn metoden sender gamestaten til server og derefter fetchen end-turn endpointen på serversiden hvilket gør det til den næste spillers tur
function endTurn() {
    const gameState = {
        diceResults: diceResults,
        diceHeld: diceHeld,
        rollsLeft: rollsLeft,
        diceSkin: diceSkin,
        scores: {
            aces: document.getElementById('aces').value,
            twos: document.getElementById('twos').value,
            threes: document.getElementById('threes').value,
            fours: document.getElementById('fours').value,
            fives: document.getElementById('fives').value,
            sixes: document.getElementById('sixes').value,
            onePair: document.getElementById('onePair').value,
            twoPairs: document.getElementById('twoPairs').value,
            threeOfAKind: document.getElementById('threeOfAKind').value,
            fourOfAKind: document.getElementById('fourOfAKind').value,
            fullHouse: document.getElementById('fullHouse').value,
            smallStraight: document.getElementById('smallStraight').value,
            largeStraight: document.getElementById('largeStraight').value,
            yahtzee: document.getElementById('yahtzee').value,
            chance: document.getElementById('chance').value,
        }
    };

    fetch('/end-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameState }) // Send the updated game state
    })
        .then(response => {
            if (response.ok) {
                console.log('Turn ended successfully');
                window.location.reload(); // Reload the game to show the next player's turn
            } else {
                console.error('Error ending turn');
            }
        });
}
