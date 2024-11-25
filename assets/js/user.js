
const createAccount = document.querySelector('#createAccount')

//createAccount functions
createAccount.onclick = async () => {
    try {
        const content = await getInput('/createAccount') //web URL
        await CreateUser("/assets/saveFiles/accounts/users.json", content);
        window.location.href = "/menu";
    } catch (e) {
        //add more relevant ERRORS
    }
}


async function CreateUser(path, content) {
    const fs = require('node:fs');

    fs.appendFile(path, content, err => {
        if(err){
            //ERROR message
        }else{
            //success message
        }
    })
}

async function getInput(url) {
    try{
        res = await fetch(url, {userName: userName.value, password: password.value}) //gets inputfield values
        return await res.json()
    }catch(err){
        return err
    }
}

