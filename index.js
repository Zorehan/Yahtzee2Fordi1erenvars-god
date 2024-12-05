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



//Læser vores game objekter fra games.json
function readGames() {
    return new Promise((resolve, reject) => {
        fs.readFile(gamesPath, 'utf-8', (err, data) => {
            if (err) reject(err);
            else resolve(JSON.parse(data));
        });
    });
}

//Skriver en game objekt til games.json
function writeGames(games) {
    return new Promise((resolve, reject) => {
        fs.writeFile(gamesPath, JSON.stringify(games, null, 2), (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}
//Finder et specifikt id ved at søge iterere igennem listen af games som readgames returner og finde den rigtige id
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

//Sender brugeren til menuen hvis useren er logget ind
app.get('/menu', (request, response) => {
    let hasUser = false;
    if(request.session.user){
        hasUser = true;
    }
    response.render('menu', { loggedIn: hasUser });
});

//Get endpoint til loginsiden
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

//Sender brugeren til en join side hvor alle games som spilleren kan joine bliver rendered (ved hjælp af playerlisten fra game.json objekterne og maxplayers)
app.get('/menu/join', async (req, res) => {
    try {
        const games = await readGames();


        const availableGames = games.filter(game => game.players && game.players.length < 3 );

        console.log('Available games:', availableGames);

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
        res.redirect(`/game/${gameId}`);
    } catch (err) {
        console.error('Error joining game:', err);
        res.status(500).send('Error joining game.');
    }
});


//Post endpoint til host siden hvor en bruger kan oprette et nyt game, herefter bliver den json der bliver modtaget i requesten gemt ned til games.json
app.post('/menu/host', async (request, response) => {
    const { gameID, playerList, playerLimit } = request.body;

    if (!gameID || playerLimit <= 0) {
        return response.status(400).send('Invalid game ID or player limit.');
    }

    try {
        const games = await readGames();

        //Her tjekker den om spilid-en brugeren prøver på at lave allerede findes og kaster fejl hvis den gør
        if (games.some((game) => game.gameId === gameID)) {
            return response.status(400).send('Game ID already exists.');
        }

        //Laver en player objekt for hver spillernavn som hosten skriver i playerList felten
        const playerNames = playerList.split(',').map(name => name.trim()).filter(name => name);
        if (!playerNames.includes(request.session.user.username)) {
            playerNames.unshift(request.session.user.username);
        }
        if (playerNames.length > playerLimit) {
            return response.status(400).send('Number of players exceeds the player limit.');
        }

        //Laver en default scorecard til alle spillere
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


        const newGame = {
            gameId: parseInt(gameID),
            players,
            maxPlayers: playerLimit,
            currentTurn: 0
        };


        games.push(newGame);
        await writeGames(games);

        response.redirect('/menu');
    } catch (error) {
        console.error('Error writing to games.json:', error);
        response.status(500).send('Server error');
    }
});

/*
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
*/

//Get endpoint til hostsiden hvor man kan oprette et spil
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

//End turn endpoint som der bliver kaldt når spilleren trykker på et felt og gamestate skal gemmes
app.post('/end-turn', async (req, res) => {
    const { gameState } = req.body;
    console.log(gameState);

    try {
        //Sikrer at requesten indeholder alt nødvendig data
        const { gameId, name, diceResults, diceHeld, rollsLeft, diceSkin, scores } = gameState;

        const game = await getGameById(gameId);

        if (!game) {
            return res.status(404).send('Game not found.');
        }


        const player = game.players.find(p => p.name === name);

        if (!player) {
            return res.status(400).send('Player not found.');
        }

        //Opdaterer data
        player.diceResults = diceResults;
        player.diceHeld = diceHeld;
        player.rollsLeft = rollsLeft;
        player.diceSkin = diceSkin;
        player.scores = scores;

        game.currentTurn = (game.currentTurn + 1) % game.players.length;

        await saveGameState(game);

        res.status(200).send('Turn ended successfully.');
    } catch (err) {
        console.error('Error processing turn:', err);
        res.status(500).send('Server error.');
    }
});

//Renderer spillet baseret på gameId
app.get('/game/:gameId', async (req, res) => {
    const { gameId } = req.params;
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

async function saveGameState(game) {
    try {
        const games = await readGames();

        const gameIndex = games.findIndex((g) => g.gameId === game.gameId);
        if (gameIndex === -1) {
            console.error('Game not found.');
            return;
        }

        games[gameIndex] = game;

        await writeGames(games);

        console.log('Game state saved successfully');
    } catch (err) {
        console.error('Error saving game state:', err);
    }
}

console.log('Server started on http://localhost:6789');
app.listen(6789)

