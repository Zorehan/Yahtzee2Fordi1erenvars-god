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
const gamesPath = path.join(__dirname, 'assets', 'json', 'games.json');
app.use(
    session({
        secret: 'bailabaila',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);

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


function readGames() {
    return new Promise((resolve, reject) => {
        fs.readFile(gamesPath, 'utf-8', (err, data) => {
            if (err) reject(err);
            else resolve(JSON.parse(data));
        });
    });
}

function getGameById(gameId) {
    return readGames().then(games => {
        return games.find(game => game.game === gameId); // Assuming 'game' is the unique identifier in your games data
    }).catch(err => {
        console.error('Error fetching game by ID:', err);
        return null;
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
app.post('/menu/join', async (request, response) => {
    const { gameID } = request.body;

    try {
        const games = await readGames();
        const game = games.find((game) => game.game === gameID);

        if (!game) {
            return response.status(404).send('Game not found.');
        }

        if (game.players.length >= game.maxPlayers) {
            return response.status(400).send('Game is full.');
        }

        // Add player to the game if not already added
        if (!game.players.some((player) => player.Player === request.session.user.username)) {
            game.players.push({
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
            });
        }
    } catch (error) {
        console.error('Error updating games.json:', error);
        response.status(500).send('Server error');
    }
});

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

// Serve the game page with turn-based logic
app.get('/game/:gameId', async (req, res) => {
    const gameId = req.params.gameId;
    console.log('Session:', req.session);  // Debugging: check session data
    try {
        const game = await getGameById(gameId); // Await the promise returned by getGameById

        if (!game) {
            return res.status(404).send('Game not found');
        }

        const username = req.session.user.username; // Get player username from session
        console.log('Player username:', username);  // Debugging: check player username

        if (!username) {
            return res.status(404).send('Player not found'); // No username in session
        }

        // Find the player in the game using the username
        const player = game.players.find(p => p.Player === username);

        if (!player) {
            return res.status(404).send('Player not found'); // If the player doesn't exist in the game
        }

        // Check if the player is a spectator (not the current turn)
        const isSpectator = game.playerTurn !== username;

        res.render('game', { game, player });
    } catch (error) {
        console.error('Error fetching game:', error);
        res.status(500).send('Error loading game');
    }
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
