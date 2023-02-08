//-- VARIAVEIS --//
const canvas = document.getElementById("game");
var gameScreen = canvas.getContext("2d");

var game = {};
var player = {};
var time;

socket.on("USERS_UPDATE", function(gamesocket, userid){
    game = JSON.parse(gamesocket);
    if(userid != 0) {
        player = game.players[userid];
    }
    placarGame(game.players);
    renderGame();
});

function renderGame(){

    gameScreen.fillStyle = "white";
    gameScreen.clearRect(0, 0, 20, 20);

    for(players in game.players){
        const playerGame = game.players[players];

        if(player.id == playerGame.id) {
            gameScreen.fillStyle = "green";;
        }else{
            gameScreen.fillStyle = "gray";
        }
        
        gameScreen.fillRect(playerGame.x, playerGame.y, 1, 1);
    }

    gameScreen.fillStyle = "yellow";
    gameScreen.fillRect(game.fruits.x, game.fruits.y, 1, 1);

    requestAnimationFrame(renderGame);
}

function gameStart(){

    time = document.getElementById("game-tempo");
    if(time.value == 0 || time.value == null) {
        alert("Digite um tempo de jogo!!");
        return;
    };

    document.getElementById("botao-start").disabled = true;
    document.getElementById("botao-stop").disabled = false;

    socket.emit("UPDATE_STATUS", 0);
}

socket.on('GAME_START', function(server){
    game = JSON.parse(server);
    placarGame(game.players);
    setTimeout(stopGame, time.value*1000);
});

socket.on('GAME_END', function(server){
    game = JSON.parse(server);
    
    if(player.id == game.winner.id){
        alert("Parabêns você ganhou!!");
    }else{
        alert(`O ganhador foi: ${game.winner.id}`);
    }

    document.getElementById("botao-start").disabled = false;
    document.getElementById("botao-stop").disabled = true;
});


function stopGame(){
    socket.emit("UPDATE_STATUS", 1);
}

function placarGame(players){
    const div = document.getElementById("div-lideres");
    var htmlContten = "";
    htmlContten += `<div class="div-lideres-item">
        <h4>Líderes de Pontuação</h4>
    </div>`;

    for(players in game.players){
        const playerGame = game.players[players];
        htmlContten += `<div class="div-lideres-item">`
        htmlContten += playerGame.id == player.id? `<p style="color: green; font-weight: bold">${playerGame.id}</p>` : `<p>${playerGame.id}</p>`;
        htmlContten += `<p class="div-user-ponto">${playerGame.points}</p></div>`
    }
    div.innerHTML = htmlContten;
};

document.addEventListener("keydown", event => {
    // if(game.gameStart == false) return;
    switch(event.code){
        case "ArrowUp": 
            if(player.y != 0){
                socket.emit("USERS_MOVE", player.id, move = {x: 0, y: -1});
            }
        break;
        case "ArrowDown":
            if(player.y != 19){
                socket.emit("USERS_MOVE", player.id, move = {x: 0, y: 1});
            }
        break;
        case "ArrowLeft":
            if(player.x != 0){
                socket.emit("USERS_MOVE", player.id, move = {x: -1, y: 0});
            } 
        break;
        case "ArrowRight": 
            if(player.x != 19){
                socket.emit("USERS_MOVE", player.id, move = {x: 1, y: 0});
            } 
        break;
    }
});

socket.on('GAME_SERVER_FULL', function(){
    window.location.href = "public/websocket.html";
});