

const dice = document.querySelectorAll('img.die');


dice.forEach(die => {
    die.onclick = async () => {
        selectDice(die)
    }
});



