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

app.post('/api/roll', (req, res) => {
    if (gameState.rollsLeft > 0) {
        for (let i = 0; i < gameState.diceResults.length; i++) {
            if (!gameState.diceHeld[i]) {
                gameState.diceResults[i] = Math.floor(Math.random() * 6) + 1;
            }
        }
        gameState.rollsLeft--;
        res.json(gameState);
    } else {
        res.status(400).json({ message: 'No rolls left' });
    }
});

app.post('/api/select-dice', (req, res) => {
    const { index } = req.body;
    if (index >= 1 && index <= 5) {
        gameState.diceHeld[index - 1] = !gameState.diceHeld[index - 1];
        res.json(gameState);
    } else {
        res.status(400).json({ message: 'Invalid dice index' });
    }
});

app.post('/api/change-skin', (req, res) => {
    const { skin } = req.body;
    if (skin === 'blackDice' || skin === 'numberedDice3d' || skin === 'whiteDice') {
        gameState.diceSkin = skin;
        res.json(gameState);
    } else {
        res.status(400).json({ message: 'Invalid dice skin' });
    }
});

app.post('/api/update-score', (req, res) => {
    const { category, score } = req.body;
    const currentGameState = currentPlayer === 1 ? gameStates.player1 : gameStates.player2;

    if (currentGameState.scores.hasOwnProperty(category)) {
        currentGameState.scores[category] = score; // Update score
        res.json({ success: true, gameState: currentGameState });
    } else {
        res.status(400).json({ success: false, message: 'Invalid score category' });
    }
});

app.get('/api/game-state', (req, res) => {
    res.json(gameState);
});

app.listen(8443, '192.168.250.207', () => {
    console.log('Server running on http://192.168.250.207:8443');
});
