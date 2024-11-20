

playerImages = []
players = []

function addVare(id,navn,pris){
    let image
    playerImages.forEach(img => {
        if(img.id == id){
            image = img
        }
    });
    if(image){
        image = placeHolderImg
    }
    players.add(new vare(id,navn,pris,img))
};

function addImg(playerID, url){
    players.add(new vareImages(playerID, url))
}