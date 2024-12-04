import express from 'express'
const app = express();
import session from 'express-session';
import fs from 'fs'
import path from 'path'

app.use(express.static('assets'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.use(express.static('assets'));
app.use(
    session({
        secret: 'bailabaila',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);
const gamesPath = 'assets/json/games.json'

//const loginsPath = path.join(__dirname, 'assets', 'playerLogins');
const loginsPath = 'assets/json/users.json';
let playerLogins = [];

//Metode der læser filen og gemmer de forskelige logins i en variable defineret øverst i koden
fs.readFile(loginsPath, 'utf-8', (err, data) => {
    if (err) {
        console.error('Error reading playerLogins', err);
    } else {
        playerLogins = (JSON.parse(data));
        console.log(playerLogins);
    }
});

let gameStates = {
    gameId: 0,
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


function readGames() {
    return new Promise((resolve, reject) => {
        fs.readFile(gamesPath, 'utf-8', (err, data) => {
            if (err) reject(err);
            else resolve(JSON.parse(data));
        });
    });
}

function writeGames(games) {
    return new Promise((resolve, reject) => {
        fs.writeFile(gamesPath, JSON.stringify(games, null, 2), (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function getGameById(gameId) {
    return readGames()
        .then((games) => games.find((game) => game.gameId === parseInt(gameId)))
        .catch((err) => {
            console.error('Error fetching game by ID:', err);
            return null;
        });
}



app.get('/', (request, response) => {
    response.redirect('/menu');
});

//Vores root .get der redirecter til lobbyen hvis man er logget ind (allerede har en session)
app.get('/menu', (request, response) => {
    let hasUser = false;
    if(request.session.user){
        hasUser = true;
    }
    response.render('menu', { loggedIn: hasUser });
});

app.get('/menu/login', (request, response) => {
    if(request.session.user){
        response.redirect('/menu',{ loggedIn: true });
    }
    response.render('login');
});

//vores .post til loginsiden hvor det bliver tjekket om man er en bruger i systemet, hvis ja bliver man redirectet til gameWaitingScreen og ellers forbliver man på loginsiden og får en error
app.post('/login', (request, response) => {
    const { username, password } = request.body;

    playerLogins.forEach(acc => {
        if(acc.username === username){
            if (acc.password === password){
                request.session.user = { username };
                response.redirect('/menu');
            } else {
                response.render('login', {
                    pageName: 'Login Site',
                    introduction: 'Please login',
                    error: 'Invalid username or password',
                });
            }
        }
    });
});

app.get('/menu/join', async (req, res) => {
    try {
        const games = await readGames(); // Get all games from the games.json file
        console.log('Games from file:', games); // Check the content of games.json

        const availableGames = games.filter(game => game.players.length < game.maxPlayers); // Filter the available games
        console.log('Available games:', availableGames); // Log filtered games

        res.render('join', { games: availableGames }); // Render the join.pug template and pass the available games
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).send('Server error');
    }
});

// Add player to a game
app.post('/menu/join', async (req, res) => {
    const { gameId } = req.body;

    try {
        const games = await readGames();
        const game = games.find((g) => g.gameId === parseInt(gameId));

        if (!game) {
            return res.status(404).send('Game not found.');
        }

        if (game.player2.username) {
            return res.status(400).send('Game is already full.');
        }

        // Add the second player
        game.player2 = {
            username: req.session.user.username,
            diceResults: [1, 1, 1, 1, 1],
            diceHeld: [false, false, false, false, false],
            rollsLeft: 3,
            diceSkin: "whiteDice",
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
        };

        await writeGames(games);
        res.redirect(`/game/${gameId}`);
    } catch (err) {
        console.error('Error joining game:', err);
        res.status(500).send('Error joining game.');
    }
});

import gamelogic from './api/Logik.js';
app.use('/gamelogic',gamelogic)

// Hosting a new game
app.post('/menu/host', async (request, response) => {
    const {gameID, password, playerLimit} = request.body;

    if (!isUsed) {
        const acc = {
            username: username,
            password: password
        }
        const err = await makeAcc(acc);
        if (err) {
            response.redirect('/menu/createAccount');
        } else {
            request.session.user = {username};
            response.redirect('/menu');
        }
    } else {
        response.redirect('/menu/createAccount');

    }

    async function makeAcc(newAcc) {
        await playerLogins.push(newAcc)
        await fs.writeFile(loginsPath, JSON.stringify(playerLogins, null, 2), (err) => {
            if (err) {
                console.error('Error creating account failed', err);
                return err;
            } else {
                console.log(playerLogins)
            }
        });
    }

    function getAcc(newAcc) {
        return new Promise((resolve, reject) => {
            playerLogins.add(newAcc)
            fs.writeFile(loginsPath, JSON.stringify(playerLogins, null, 2), (err) => {
                if (err) {
                    console.error('Error reading playerLogins', err);
                } else {
                    console.log(playerLogins)
                }
            });
        });
    }


// OLD COD
    app.post('/menu/join', async (request, response) => {
        // Create a new game and include the host player
        const newGame = {
            game: gameID,
            host: request.session.user.username,
            playerTurn: request.session.user.username, // Set the host as the starting player
            maxPlayers: playerLimit,
            dice: {
                diceSkin: "whiteDice",
                Results: [1, 1, 1, 1, 1],
                Held: [false, false, false, false, false],
                rollsLeft: 3,
            },
            players: [
                {
                    Player: request.session.user.username,
                    scores: {
                        aces: false,
                        twos: false,
                        threes: false,
                        fours: false,
                        fives: false,
                        sixes: false,
                        onePair: false,
                        twoPairs: false,
                        threeOfAKind: false,
                        fourOfAKind: false,
                        fullHouse: false,
                        smallStraight: false,
                        largeStraight: false,
                        yahtzee: false,
                        chance: false,
                    },
                },
            ], // Add the host player to the players array
        };

        games.push(newGame);
        await writeGames(games);

        response.redirect('/menu/host');

    });
});
app.get('/menu/host', (request, response) => {
    if (request.session.user) {
        readGames().then((games) => {
            const userGames = games.filter(game => game.host === request.session.user.username);
            response.render('host', {
                pageName: 'Host Game',
                yourGames: userGames,
            });
        }).catch((err) => {
            console.error('Error reading games:', err);
            response.status(500).send('Server error');
        });
    } else {
        response.redirect('/menu/login');
    }
});

app.post('/end-turn', async (req, res) => {
    const { gameId, gameState } = req.body; // Received gameId and game state from client

    try {
        const games = await readGames();
        const game = games.find((g) => g.gameId === parseInt(gameId));

        if (!game) {
            return res.status(404).send('Game not found.');
        }

        if (req.session.user.username === game.player1.username) {
            game.player1 = { ...game.player1, ...gameState };
            game.currentTurn = "player2"; // Switch to player2
        } else if (req.session.user.username === game.player2.username) {
            game.player2 = { ...game.player2, ...gameState };
            game.currentTurn = "player1"; // Switch to player1
        }

        await writeGames(games);
        res.redirect(`/game/${gameId}`);
    } catch (err) {
        console.error('Error ending turn:', err);
        res.status(500).send('Error ending turn.');
    }
});

// Serve the game page with turn-based logic
app.get('/game/:gameId', async (req, res) => {
    const gameId = req.params.gameId;

    try {
        const game = await getGameById(gameId);

        if (!game) {
            return res.status(404).send('Game not found.');
        }

        const username = req.session.user?.username;

        if (!username) {
            return res.status(403).send('User not logged in.');
        }

        const isPlayer1 = game.player1.username === username;
        const isPlayer2 = game.player2.username === username;

        if (!isPlayer1 && !isPlayer2) {
            return res.status(403).send('You are not a player in this game.');
        }

        const isSpectator = (game.currentTurn === "player1" && !isPlayer1) ||
            (game.currentTurn === "player2" && !isPlayer2);

        res.render('game', {
            game,
            player: isPlayer1 ? game.player1 : game.player2,
            isSpectator,
        });
    } catch (err) {
        console.error('Error fetching game:', err);
        res.status(500).send('Error loading game.');
    }
});

app.get('/game', (req, res) => {
    if (!gameInProgress) {
        return res.redirect('/');
    }

    // Get the current game state based on which player's turn it is
    const currentGameState = currentPlayer === 1 ? gameStates.player1 : gameStates.player2;

    res.render('game', {
        player: currentPlayer,
        gameState: currentGameState,
    });
});

let currentPlayer = 1;
let gameInProgress = false;

app.post('/start-game', (req, res) => {
    currentPlayer = 1;
    gameInProgress = true;
    res.redirect('/game');
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
