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

app.get('/', (request, response) => {
    response.redirect('/menu');
});

//Vores root .get der redirecter til lobbyen hvis man er logget ind (allerede har en session)
app.get('/menu', (request, response) => {
    let hasUser = false
    if(request.session.user){
        hasUser = true;
    }
    response.render('menu', { loggedIn: hasUser });
});

app.get('/menu/login', (request, response) => {
    if(request.session.user){
        response.redirect('/menu',{ loggedIn: true });
    }
    response.render('login')
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
                response.redirect('/menu/login');
            }
        }
    });
});

//
app.get('/menu/join', async (request, response) => {
    if (request.session.user) {
        const games = await getGames(request);
        response.render('join', {
            pageName: 'Join Game',
            games: games,
        });
    } else {
        response.redirect('/menu');
    }
});


// bruger gameWaitingScreen 
// mangler at opdatere json filer
app.get('/menu/host', async (request, response) => {
    if (request.session.user) {
        const yourGames = await getGames();
        response.render('host', {
            pageName: 'Host Game',
            yourGames: yourGames
        });
    } else {
        response.redirect('/menu');
    }
});

app.post('/createGame', async (request, response) => {
    const {gameID, password, playerLimit} = request.body;
    if (gameID != '' && playerLimit > 0) {
        games.
        window.location.reload();
    } else {
        response.render('host', {
            pageName: 'Host Game',
            introduction: 'Please login',
            error: 'Invalid username or password',
        });
    }
});

app.get('/menu/settings', (request, response) => {
    if (request.session.user) {
        response.render('settings', {
            pageName: 'Settings',
            user: request.session.user,
        });
    } else {
        response.redirect('/menu');
    }
});

//Logout pathen fjerner sessionen så man ikke længere counter som at være logget ind
app.get('/logout', (request, response) => {
    request.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
        }
        response.redirect('/menu');
    });
});


app.get('/menu/createAccount', async (request, response) => {
    if (!request.session.user) {
        response.render('createAccount');
    } else {
        response.redirect('/menu');
    }
});
app.post('/createAccount', async (request, response) => {
    const { username, password } = request.body;

    let isUsed = false
    playerLogins.forEach(acc => {
        if(acc.username === username || acc.password === password){
            isUsed = true
        }
    });

    if(!isUsed){
        const acc = {
            username: username, 
            password: password 
        }
        const err = await makeAcc(acc);
        if (err){
            response.redirect('/menu/createAccount');
        } else {
            request.session.user = { username };
            response.redirect('/menu');
        }
    }else{
        response.redirect('/menu/createAccount');
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


// OLD CODE


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
