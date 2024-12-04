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
    playerLogins.push(newAcc)
    await fs.writeFile(loginsPath, JSON.stringify(playerLogins, null, 2), (err) => {
        if (err) {
            console.error('Error creating account failed', err);
            return err;
        } else {
            console.log(playerLogins)
        }
    })
}