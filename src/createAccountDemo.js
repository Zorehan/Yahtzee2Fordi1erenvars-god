app.post('/createAccount', (request, response) => {
    const { username, password } = request.body;

    //check for username
    let taken = false;
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if(username === element){
            taken = true
        }
    }

    //check for password
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if(password === element){
            taken = true
        }
    }

    //if username and password is available open login page
    if (!taken) {
        request.session.user = { username };

        if (!lobbyUsers.includes(username)) {
            lobbyUsers.push(username);
        }

        response.redirect('/login');
    } else {
        response.render('createAccount', {
            pageName: 'createAccount Site',
            introduction: 'Please create an account',
            error: 'username or password is taken or invalid',
        });
    }
});