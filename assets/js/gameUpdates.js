
function rollDie(){
    let roll = Math.floor(Math.random() * 6) + 1;
    die.value = roll;
    return die;
}

function pickScore(dice){
    let sum = 0;
    dice.forEach(die => {
        sum = sum + die;
    });
    return sum;
}

function scoreSum(scores){
    let sum = 0;
    scores.forEach(score => {
        sum = sum + score;
    });
    return sum;
}