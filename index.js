const express = require ('express')
const app = express();
const session = require('express-session')
const fs= require('fs')
const path = require('path')

app.use(express.static('assets'))
app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'pug');
app.use(express.static('assets'))

app.use(
    session({
        secret: 'bailabaila',
        resave: false,
        saveUninitialized: true,
        cookie:{secure: false}
    })
)

const loginsPath = path.join(__dirname, 'assets', 'playerLogins');
let playerLogins = {};
let lobbyUsers = [];

fs.readFile(loginsPath, 'utf-8', (err,data) =>{
    if(err){
        console.error('Error reading playerLogins', err)
    }else{
        playerLogins = data.split('\n').reduce((acc, line) => {
            const [username, password] = line.split(':')
            if (username && password) acc[username.trim()] = password.trim();
            return acc;

        }, {});
    }
})

app.get('/', (request, response) =>{
    if(request.session.user)
    {
        response.redirect('/gameWaitingScreen');
    }else{
        response.render('login',{
            pageName: 'Login Site',
            introduction: 'Please login'
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
        lobbyUsers = lobbyUsers.filter(user => user !== username);
    }

    request.session.destroy(err => {
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

app.listen(8443, '10.10.131.197', () => {
});

