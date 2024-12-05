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
app.use(express.static(path.join(__dirname, 'assets/css')));
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
    gameId: 12,
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
        const games = await readGames(); // Read all games from games.json

        // Filter games based on whether the players array has less than 2 players
        const availableGames = games.filter(game => game.players && game.players.length < 3 );

        // Log filtered games for debugging
        console.log('Available games:', availableGames);

        // Render the join.pug template and pass available games
        res.render('join', { games: availableGames });
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


// Hosting a new game
app.post('/menu/host', async (request, response) => {
    const { gameID, playerList, playerLimit } = request.body;

    if (!gameID || playerLimit <= 0) {
        return response.status(400).send('Invalid game ID or player limit.');
    }

    try {
        const games = await readGames();

        // Check if the game already exists
        if (games.some((game) => game.gameId === gameID)) {
            return response.status(400).send('Game ID already exists.');
        }

        // Parse the player list and add the host as the first player
        const playerNames = playerList.split(',').map(name => name.trim()).filter(name => name);
        if (!playerNames.includes(request.session.user.username)) {
            playerNames.unshift(request.session.user.username); // Ensure the host is included
        }
        if (playerNames.length > playerLimit) {
            return response.status(400).send('Number of players exceeds the player limit.');
        }

        // Initialize players with default data
        const players = playerNames.map(name => ({
            name,
            diceResults: [1, 1, 1, 1, 1],
            diceHeld: [false, false, false, false, false],
            rollsLeft: 3,
            diceSkin: "whiteDice",
            scores: {
                aces: "",
                twos: "",
                threes: "",
                fours: "",
                fives: "",
                sixes: "",
                onePair: "",
                twoPairs: "",
                threeOfAKind: "",
                fourOfAKind: "",
                fullHouse: "",
                smallStraight: "",
                largeStraight: "",
                yahtzee: "",
                chance: ""
            }
        }));

        // Create the game object
        const newGame = {
            gameId: parseInt(gameID),
            players,
            maxPlayers: playerLimit,
            currentTurn: 0 // Starting with the first player in the list
        };

        // Add the new game to the list and save
        games.push(newGame);
        await writeGames(games);

        response.redirect('/menu/host');
    } catch (error) {
        console.error('Error writing to games.json:', error);
        response.status(500).send('Server error');
    }
});

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
    const { gameState } = req.body;
    console.log(gameState);

    try {
        // Ensure gameState contains the correct properties
        const { gameId, name, diceResults, diceHeld, rollsLeft, diceSkin, scores } = gameState;

        // Find the game by its ID
        const game = await getGameById(gameId);

        if (!game) {
            return res.status(404).send('Game not found.');
        }

        // Find the player in the game
        const player = game.players.find(p => p.name === name);

        if (!player) {
            return res.status(400).send('Player not found.');
        }

        // Update player data
        player.diceResults = diceResults;
        player.diceHeld = diceHeld;
        player.rollsLeft = rollsLeft;
        player.diceSkin = diceSkin; // Make sure to update dice skin as well if needed
        player.scores = scores;

        // Update game data (current turn, etc.)
        game.currentTurn = (game.currentTurn + 1) % game.players.length;

        // Save the updated game state back to the database or file
        await saveGameState(game);

        res.status(200).send('Turn ended successfully.');
    } catch (err) {
        console.error('Error processing turn:', err);
        res.status(500).send('Server error.');
    }
});

// Serve the game page with turn-based logic
app.get('/game/:gameId', async (req, res) => {
    const { gameId } = req.params; // Extract gameId from request parameters
    const game = await getGameById(gameId);

    const username = req.session.user?.username;

    if (!username) {
        return res.status(403).send('User not logged in.');
    }

    const player = game.players.find(p => p.name === username);
    if (!player) {
        return res.status(403).send('You are not a player in this game.');
    }

    const isSpectator = game.players[game.currentTurn] !== player;
    res.render('game', { game, player, isSpectator });
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

async function saveGameState(game) {
    try {
        // Read the current games from the file
        const games = await readGames();

        // Find the game by its ID and update it
        const gameIndex = games.findIndex((g) => g.gameId === game.gameId);
        if (gameIndex === -1) {
            console.error('Game not found.');
            return;
        }

        // Update the game state with the new data
        games[gameIndex] = game;

        // Write the updated game state back to the file
        await writeGames(games);

        console.log('Game state saved successfully');
    } catch (err) {
        console.error('Error saving game state:', err);
    }
}

console.log('Server started on http://localhost:6789');
app.listen(6789)

