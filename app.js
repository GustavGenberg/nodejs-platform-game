var config = require('./config.js'),
    express = require('express'),
    io = require('socket.io')(config.server.socket.port),
    app = express(),
    util = require('util'),
    EncodeObjects = require('./EncodeObjects.js');

// Custom Functions

var c = {
  log: function (data) {
    console.log(data);
    //console.log('>> ');
  }
};

// END Custom Functions

// Express Webserver
app.use(express.static(__dirname + '/www/'));
app.listen(config.server.express.port, function () {
  c.log('Express app listening on port ' + config.server.express.port);
  c.log('Socket.io Server listening on port ' + config.server.socket.port);
});
// END Express Webserver

io.on('connect', function (socket) {
  Game.Count.Players++;
  O.Socket[Game.Count.Players] = socket;

  O.Player[Game.Count.Players] = new Game.Object.Player(
    {
      id: Game.Count.Players,
      nickname: 'JOHN CENA',
      x: 100,
      y: 150,
      width: 30,
      height: 50
    }
  );

  socket.emit('Sprites', Sprites);
  socket.emit('Config', {ID: Game.Count.Players, Pattern: EncodeObjects.Pattern});
});

var O = { Socket: { }, Interval: { }, Player: { }, Block: { }, DZ: { } },
Sprites = {
  00001: '/images/Player.png',
  00002: '/images/Block.png'
}, Game = {
  Count: {
    Players: 0,
    Blocks: 0,
    DZ: 0
  },
  Map: {
    Reset: function () {
      for (block in O.Block) {
        var block = O.Block[block];
        delete O.Block[block.id];
      }
      Game.Map.createBlocks();
    },
    createBlocks: function () {

      var A = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];
      for (var f = 0;f<A.length;f++) {
        for (var i = 0;i<A[0].length;i++) {
          if(A[f][i] == 1) {
            Game.Count.Blocks++;

            O.Block[Game.Count.Blocks] = new Game.Object.Block(
              {
                id: Game.Count.Blocks,
                x: 0 + 55 * i,
                y: 5 + 55 * f,
                w: 50,
                h: 50
              }
            );
          }

          if(A[f][i] == 0) {
            Game.Count.DZ++;

            O.DZ[Game.Count.DZ] = new Game.Object.DZ(
              {
                id: Game.Count.DZ,
                x: 0 + 55 * i,
                y: 5 + 55 * f,
                w: 50,
                h: 50
              }
            );
          }
        }
      }

    },
    PlayerCount: function () { return Object.keys(O.Player).length }
  },
  Object: {
    Player: function (a) {
      for(var i = 0;i < Object.keys(a).length;i++) {
        this[Object.keys(a)[i]] = a[Object.keys(a)[i]];
      }

      this.Mouse = {x: 0, y: 0};
      this.KeysDown = {};
      this.LastMove = 0;
      this.Time = {};
      this.speed = config.Objects.Player.Default.speed;

      this.init();

    },
    Block: function (a) {
      for(var i = 0;i < Object.keys(a).length;i++) {
        this[Object.keys(a)[i]] = a[Object.keys(a)[i]];
      }

      this.c = 'rgb(29, 71, 96)';
      this.a = 100;
    },
    DZ: function (a) {
      for(var i = 0;i < Object.keys(a).length;i++) {
        this[Object.keys(a)[i]] = a[Object.keys(a)[i]];
      }
    }
  }
};


Game.Object.Player.prototype = {
  log: function (data) {
    c.log('Player ' + this.id + ': ' + data);
  },
  init: function () {
    var player = this;

    player.log('Connected');

    player.ioEvents();
    player.Move();
  },
  ioEvents: function () {
    var player = this;
    var socket = O.Socket[player.id];

    socket.on('disconnect', function () {
      player.log('Disconnected');
      delete O.Socket[player.id];
      delete O.Player[player.id];
    });

    socket.on('collisionDetection', function (a) {
      player.log('FALL');
      for (block in O.DZ) {
        var block = O.DZ[block];
        var coll = false;

        if(player.x >= (block.x)
          && (player.x + player.width) <= (block.x + block.w)
          && (player.y + player.height) >= (block.y)
          && (player.y + player.height) <= (block.y + block.h)
        ) {
          delete O.Player[player.id];
        }
      }
    });

    socket.on('KeysDown', function (KeysDown) {
      player.KeysDown = KeysDown;
    });

    socket.on('MouseMove', function (Mouse) {
      player.Mouse = Mouse;
      player.Time.Mouse = {Now: new Date().getTime()};

      player.Time.Mouse.A = player.Time.Mouse.Now - player.Time.Mouse.L / 1000;

      for (block in O.Block) {
        var block = O.Block[block];

        if(Mouse.State == 1) {
          if(Mouse.x >= (block.x)
          && Mouse.x <= (block.x + block.w)
          && Mouse.y >= (block.y)
          && Mouse.y <= (block.y + block.h)) {
            block.c = 'rgb(244, 241, 19)';
            block.a -= 10;
            if(block.a <= 0) {
              Game.Count.DZ++;
              O.DZ[Game.Count.DZ] = new Game.Object.DZ(
                {
                  id: Game.Count.DZ,
                  x: block.x,
                  y: block.y,
                  w: block.w,
                  h: block.h
                }
              );
              delete O.Block[block.id];
            }
          } else {
            block.c = 'rgb(29, 71, 96)';
            block.a = 100;
          }
        } else {
          block.c = 'rgb(29, 71, 96)';
          block.a = 100;
        }
      }

      player.Time.Mouse.L = player.Time.Mouse.Now;
    });
  },
  Move: function () {

    var player = this;

    O.Interval[player.id] = setInterval(function () {

      var Now = new Date().getTime();
      var TimeElapsed = /*(Now - player.LastMove) / 1000*/1;

      /*
      38 : UP
      40 : DOWN
      37 : LEFT
      39 : RIGHT
      */

      if(player.KeysDown[38] == true) {
        player.y -= TimeElapsed * player.speed;
      }
      if(player.KeysDown[40] == true) {
        player.y += TimeElapsed * player.speed;
      }
      if(player.KeysDown[37] == true) {
        player.x -= TimeElapsed * player.speed;
      }
      if(player.KeysDown[39] == true) {
        player.x += TimeElapsed * player.speed;
      }

      player.LastMove = Now;

    }, 1000 / config.Map.FRAMERATE);
  }
};

Game.Object.Block.prototype = {

};

// Command Line
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (command) {
  command = command.replace('\n', '');

  // Commands
  var Commands = {
    quit: {
      call: function () {
        process.exit();
      }
    },
    exit: {
      call: function () {
        process.exit();
      }
    },
    playercount: {
      call: function () {
        c.log(Game.Map.PlayerCount());
      }
    },
    reset: {
      call: function () {
        Game.Map.Reset();
      }
    }
  }

  if(Commands[command]) {
    Commands[command].call();
  } else {
    c.log('Command not found');
  }

});

// End Command Line


setInterval(function () {
  io.emit('r', [EncodeObjects.Encode(O.Player), EncodeObjects.Encode(O.Block), EncodeObjects.Encode(O.DZ)]);;
}, 1000 / config.Map.FRAMERATE);

Game.Map.createBlocks();
