const express = require('express');
const app = express();
const http = require('http');
const { exit } = require('process');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use("/public", express.static("public", {}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var game =  {
    gameStart: false,
    players: {},
    fruits: {},
    winner: {}
}

io.on('connection', (socket) => {

  if(Object.keys(game.players).length > 8){
    socket.emit("GAME_SERVER_FULL");
  }

  console.log(`[${socket.id}] LOG:USER_CONNECT`);

  game.players[socket.id] = {id: socket.id, x:0, y:0, points: 0};
  game.fruits = {x:10, y:10};

  socket.emit("USERS_UPDATE", JSON.stringify(game), socket.id);
  socket.local.emit("USERS_UPDATE", JSON.stringify(game), 0);

  socket.on('disconnect', ()=>{
    delete game.players[socket.id];

    socket.emit("USERS_UPDATE", JSON.stringify(game), socket.id);
    socket.local.emit("USERS_UPDATE", JSON.stringify(game), 0);
   
    console.log(`[${socket.id}] LOG:USER_DISCONNECT`);
  });

  socket.on('UPDATE_STATUS', function(status){

    if(status == 0){
      gameStart();
      return;
    }

    gameEnd();
  });

  socket.on('USERS_MOVE', function(id, move){
    game.players[id].x += move.x;
    game.players[id].y += move.y;
    checkMoveUser(id);
    socket.emit("USERS_UPDATE", JSON.stringify(game), socket.id);
    socket.local.emit("USERS_UPDATE", JSON.stringify(game), 0);
  });

  function checkMoveUser(id){
    if(game.players[id].x == game.fruits.x && game.players[id].y == game.fruits.y){
  
        game.players[id].points++;
        game.fruits.x = parseInt(Math.random() * 20);
        game.fruits.y = parseInt(Math.random() * 20);
  
    }
  };

  function gameStart(){

    for(player in game.players){
      const playerGame = game.players[player];
      playerGame.x = 0;
      playerGame.y = 0;
      playerGame.points = 0;
    }

    game.gameStart = true;
    game.fruits = {x:10, y:10};
    game.winnerUser = undefined;

    socket.emit('GAME_START', JSON.stringify(game));
    socket.broadcast.emit('GAME_START', );
  }

  function gameEnd(){

    var winnerUser = {id: "", x: 0, y:0, points: -1};

    for(player in game.players){
      const playerGame = game.players[player];
      if(playerGame.points > winnerUser.points){
        winnerUser = playerGame;
      }
    }
    game.gameStart = false;
    game.winner = winnerUser;
    socket.emit('GAME_END', JSON.stringify(game)); 
    socket.broadcast.emit('GAME_END', JSON.stringify(game));
  }
});

server.listen(PORT, () => {
  console.log('listening on *:3000');
});
