const express = require('express');
const app = express();
const session = require('express-session');
const fs = require('fs');
const path = require('path');

app.use(express.static('assets'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'assets')));

app.use(
    session({
        secret: 'bailabaila',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);

const loginsPath = path.join(__dirname, 'assets', 'playerLogins');
let playerLogins = {};
let lobbyUsers = [];
//JSON TEMPLATE TIL VORES GAMESTATES
let gameStates = {
    player1: {
        diceResults: [1, 1, 1, 1, 1],
        diceHeld: [false, false, false, false, false],
        rollsLeft: 3,
        diceSkin: 'whiteDice',
        scores: {
            aces: 0,
            twos: 0,
            threes: 0,
            fours: 0,
            fives: 0,
            sixes: 0,
            onePair: 0,
            twoPairs: 0,
            threeOfAKind: 0,
            fourOfAKind: 0,
            fullHouse: 0,
            smallStraight: 0,
            largeStraight: 0,
            yahtzee: 0,
            chance: 0,
        },
    },
    player2: {
        diceResults: [1, 1, 1, 1, 1],
        diceHeld: [false, false, false, false, false],
        rollsLeft: 3,
        diceSkin: 'whiteDice',
        scores: {
            aces: 0,
            twos: 0,
            threes: 0,
            fours: 0,
            fives: 0,
            sixes: 0,
            onePair: 0,
            twoPairs: 0,
            threeOfAKind: 0,
            fourOfAKind: 0,
            fullHouse: 0,
            smallStraight: 0,
            largeStraight: 0,
            yahtzee: 0,
            chance: 0,
        },
    },
};
//Metode der læser filen og gemmer de forskelige logins i en variable defineret øverst i koden
fs.readFile(loginsPath, 'utf-8', (err, data) => {
    if (err) {
        console.error('Error reading playerLogins', err);
    } else {
        playerLogins = data.split('\n').reduce((acc, line) => {
            const [username, password] = line.split(':');
            if (username && password) acc[username.trim()] = password.trim();
            return acc;
        }, {});
    }
});
//Vores root .get der redirecter til lobbyen hvis man er logget ind (allerede har en session)
app.get('/', (request, response) => {
    if (request.session.user) {
        response.redirect('/gameWaitingScreen');
    } else {
        response.render('login', {
            pageName: 'Login Site',
            introduction: 'Please login',
        });
    }
});

//vores .post til loginsiden hvor det bliver tjekket om man er en bruger i systemet, hvis ja bliver man redirectet til gameWaitingScreen og ellers forbliver man på loginsiden og får en error
app.post('/login', (request, response) => {
    const { username, password } = request.body;

    if (playerLogins[username] && playerLogins[username] === password) {
        request.session.user = { username };

        if (!lobbyUsers.includes(username)) {
            lobbyUsers.push(username);
        }

        response.redirect('/gameWaitingScreen');
    } else {
        response.render('login', {
            pageName: 'Login Site',
            introduction: 'Please login',
            error: 'Invalid username or password',
        });
    }
});


//Logout pathen fjerner sessionen så man ikke længere counter som at være logget ind
app.get('/logout', (request, response) => {
    if (request.session.user) {
        const username = request.session.user.username;
        lobbyUsers = lobbyUsers.filter((user) => user !== username);
    }

    request.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
        }
        response.redirect('/');
    });
});


//Gamewaiting screen er vores lobby som viser hvilke brugere der venter og er klar til et spil
app.get('/gameWaitingScreen', (request, response) => {
    if (request.session.user) {
        response.render('gameWaitingScreen', {
            username: request.session.user.username,
            users: lobbyUsers,
            pageName: 'Game Lobby',
        });
    } else {
        response.redirect('/');
    }
});

let currentPlayer = 1;
let gameInProgress = false;


app.post('/start-game', (req, res) => {
    currentPlayer = 1;
    gameInProgress = true;
    res.redirect('/game');
});

//.get /game redirecter til vores lobbyskærm hvis knappen start-game ikke er blevet trykket endnu, ellers henter den gamestatesne, hvilken spiller der starter, og sender det afsted til game.pug
// filen som så er vores yahtzee bræt
app.get('/game', (req, res) => {
    if (!gameInProgress) {
        return res.redirect('/');
    }

    const currentGameState = currentPlayer === 1 ? gameStates.player1 : gameStates.player2;

    res.render('game', {
        player: currentPlayer,
        gameState: currentGameState,
    });
});


//End turn er et endpoint som vi kalder efter når en tur er færdig, den tager den currentplayer værdien og flipper den og sætter en ny /game i gang hvor det så er den nye spillers tur
app.post('/end-turn', (req, res) => {
    const { gameState } = req.body;

    if (currentPlayer === 1) {
        gameStates.player1 = { ...gameStates.player1, ...gameState };
        currentPlayer = 2;
    } else {
        gameStates.player2 = { ...gameStates.player2, ...gameState };
        currentPlayer = 1;
    }


    res.redirect('/game');
});

//Denne her endpoint bliver brugt til at gemme/opdatere gamestaten det sker ved at vi tager fat i det gamestate som der tilhører den spiller som i øjeblikket er ved at tage turen
//og opdatere de forskellige værdier
app.post('/api/update-score', (req, res) => {
    const { category, score } = req.body;
    const currentGameState = currentPlayer === 1 ? gameStates.player1 : gameStates.player2;

    if (currentGameState.scores.hasOwnProperty(category)) {
        currentGameState.scores[category] = score;
        res.json({ success: true, gameState: currentGameState });
    } else {
        res.status(400).json({ success: false, message: 'Invalid score category' });
    }
});


//En meget simpel endpoint der bare returner gamestaten til klientsiden
app.get('/api/game-state', (req, res) => {
    res.json(gameState);
});

app.listen(8443, 'localhost', () => {
    console.log('Server running on http://localhost:8443');
});
