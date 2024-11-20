const container = document.getElementById('#container')
const id = document.querySelector('#id')
const button = document.querySelector('#button')
const playerImages = {id, url}
const placeHolderImg = 'assets\\images\\image.png'
const player = {id,navn,img}

//button.onClick = () => {}
button.addEventListener('click', async ()=>{
    const res = await post('/create', {id: vareID})
    console.log(res)

    if(res.status === "OK"){
        res.innerHTML = ''
    }else{
        res.innerHTML = ''
    }
})

async function post(url, objekt) {
    const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(objekt),
        headers: {'Content-Type': 'application/json'}
    })
    if(res.status !== "201"){
        throw new Error()
    }
    return await res.json()
}



playerImages = []
players = []

function addUser(id, name, img){
    if(!image){
        image = placeHolderImg
    }

    const user = {"playerID": id, "playerName": name, "profileImg": img}
    
    JSON.parse(user)
};

function addImg(url){
    varer.add(new vareImages(url))
}