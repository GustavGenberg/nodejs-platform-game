var Game = {io: io(':3000'), canvas: {}, FPS: {c: 0, o: 0}, rFPS: {c: 0, o: 0}, r: { }, Mouse: {x: 0, y: 0, State: 0}, KeysDown: { 38: false, 40: false, 37: false, 39: false }, cache: { }}, init = function () {
  window.requestAnimationFrame = window.requestAnimationFrame || requestAnimationFrame;
  Game.canvas = {
    init: function () {
      this.e = document.createElement('canvas')
      this.e.width = 600
      this.e.height = 500
    },
    append: function () {
      document.body.appendChild(this.e);
    },
    ctx: function () {
      return this.e.getContext('2d')
    }/*,
    reSize: function () {
      this.e.width = window.innerWidth
      this.e.height = window.innerHeight
    }*/
  };
  Game.Draw = {
    Player: function (n, i, x, y, w, h) {
      var ctx = Game.canvas.ctx();

      ctx.beginPath();

      ctx.drawImage(Game.Images[1], 0, 0, Game.Images[1].width, Game.Images[1].height, x, y, w, h);
      ctx.fillStyle = '#FFF';
      ctx.fillText(n, x, y);

      ctx.closePath();
    },
    Block: function (i, x, y, w, h, c) {
      var ctx = Game.canvas.ctx();

      ctx.beginPath();

      ctx.drawImage(Game.Images[2], 0, 0, Game.Images[2].width, Game.Images[2].height, x, y, w, h);
      ctx.lineWidth = 2;
      ctx.strokeStyle = c;
      ctx.strokeRect(x, y, w, h);

      ctx.closePath();

    },
    Arc: function (x, y, r, lw, a) {
      var ctx = Game.canvas.ctx();

      ctx.beginPath();

      ctx.arc(x, y, r, 0 - 0.5 * Math.PI, (0 - 0.5 * Math.PI) + ((2 * Math.PI / 100) * a));
      ctx.lineWidth = lw;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.stroke();

      ctx.closePath();
    },
    Info: function () {
      var ctx = Game.canvas.ctx();

      ctx.beginPath();
      ctx.fillStyle = '#000';
      ctx.fillText('FPS: ' + Game.FPS.o, 10, 10);
      ctx.fillText('rFPS: ' + Game.rFPS.o, 6, 20);
      ctx.closePath();
    },
    Clear: function () {
      var ctx = Game.canvas.ctx();

      ctx.clearRect(0, 0, Game.canvas.e.width, Game.canvas.e.height);
    }
  }

  Game.canvas.init();
  Game.canvas.append();

  //window.onresize = Game.canvas.reSize();

  var draw = function () {

    var ctx = Game.canvas.ctx();

    Game.Draw.Clear();

    Game.BLOCKI = null;
    for (block in Game.r[1]) {
      var block = Game.r[1][block];
      Game.Draw.Block(block.id, block.x, block.y, block.w, block.h, block.c);

      if(Game.Mouse.State == 1) {
        if(Game.Mouse.x >= (block.x)
          && Game.Mouse.x <= (block.x + block.w)
          && Game.Mouse.y >= (block.y)
          && Game.Mouse.y <= (block.y + block.h)) {
          Game.BLOCKA = block.a;
          Game.BLOCKI = true;
        }
      }
    }

    for (player in Game.r[0]) {
      var player = Game.r[0][player];
      Game.Draw.Player(player.nickname, player.id, player.x, player.y, player.width, player.height);
    }

    ctx.beginPath();
    ctx.moveTo(30, 30);
    ctx.lineTo(100, 100);

    ctx.moveTo(30, 470);
    ctx.lineTo(100, 400);

    ctx.moveTo(570, 30);
    ctx.lineTo(500, 100);

    ctx.moveTo(570, 470);
    ctx.lineTo(500, 400);
    ctx.strokeStyle = '#FFF';
    ctx.stroke();

    if(Game.Mouse.State == 1 && Game.BLOCKI) {
      Game.Draw.Arc(Game.Mouse.x, Game.Mouse.y, 50, 10, -Game.BLOCKA);
    }

    Game.Draw.Info();

    for (block in Game.r[2]) {
      var block = Game.r[2][block];

      if(Game.r[0][Game.Config.ID]) {
        if(Game.r[0][Game.Config.ID].x >= (block.x)
          && (Game.r[0][Game.Config.ID].x + Game.r[0][Game.Config.ID].width) <= (block.x + block.w)
          && (Game.r[0][Game.Config.ID].y + Game.r[0][Game.Config.ID].height) >= (block.y)
          && (Game.r[0][Game.Config.ID].y + Game.r[0][Game.Config.ID].height) <= (block.y + block.h)
        ) {
          Game.io.emit('collisionDetection');
        }
      }
    }


    Game.FPS.c++;
    Game.requestAnimationFrame = window.requestAnimationFrame(draw, Game.canvas.e);
  };

  draw();

  // Receiving Game Data
  Game.io.on('r', function (r) {
    Game.r[0] = JSON.parse(r[0]);
    Game.r[1] = JSON.parse(r[1]);
    Game.r[2] = JSON.parse(r[2]);
    Game.rFPS.c++;
  });
  // END Receiving Game Data

  // Events

  Game.canvas.e.addEventListener('mousemove', function (event) {
    Game.Mouse.x = event.clientX - Game.canvas.e.offsetLeft;
    Game.Mouse.y = event.clientY - Game.canvas.e.offsetTop;
  });

  Game.canvas.e.addEventListener('mousedown', function (event) {
    Game.Mouse.State = 1;
  });

  Game.canvas.e.addEventListener('mouseup', function (event) {
    Game.Mouse.State = 0;
  });

  Game.canvas.e.addEventListener('contextmenu', function (event) { event.preventDefault() });

  document.addEventListener('keydown', function (event) {
    /*
    38 : UP
    40 : DOWN
    37 : LEFT
    39 : RIGHT
    */
    if([38, 40, 37, 39].indexOf(event.keyCode) > -1) {
      if(Game.KeysDown[event.keyCode] == false) {
        Game.KeysDown[event.keyCode] = true;
        Game.io.emit('KeysDown', Game.KeysDown);
      }
    }
  });

  document.addEventListener('keyup', function (event) {
    /*
    38 : UP
    40 : DOWN
    37 : LEFT
    39 : RIGHT
    */
    if([38, 40, 37, 39].indexOf(event.keyCode) > -1) {
      if(Game.KeysDown[event.keyCode] == true) {
        Game.KeysDown[event.keyCode] = false;
        Game.io.emit('KeysDown', Game.KeysDown);
      }
    }
  });

  setInterval(function () {
    //if(Game.Mouse.timeout) return;

    Game.io.emit('MouseMove', Game.Mouse);

    /*Game.Mouse.timeout = true;
    setTimeout(function () {
      delete Game.Mouse.timeout;
    }, 100);*/
  }, 100);

  /*setInterval(function () {
    if(Game.KeysDown.toString() != Game.cache.KeysDown) {
      Game.io.emit('KeysDown', Game.KeysDown);
    }
    Game.cache.KeysDown = '';
    Game.cache.KeysDown = Game.KeysDown.toString();
  }, 100);*/


  // END Events

  // FPS Counter

  setInterval(function () {
    Game.FPS.o = Game.FPS.c;
    Game.rFPS.o = Game.rFPS.c;

    Game.FPS.c = 0;
    Game.rFPS.c = 0;
  }, 1000);

  // END FPS Counter
};

var main = function () {
  Game.io.on('connect', function () {

    if(Game.disconnected) {
      Game.io.disconnect();
      location.reload();
    }

    console.log('Socket connected');

    Game.io.on('Config', function (Config) {
      Game.Config = Config;
    });
    Game.io.on('Sprites', function (Sprites) {
      Game.Images = {};
      for(var i = 0;i < Object.keys(Sprites).length;i++) {
        Game.Images[Object.keys(Sprites)[i]] = new Image();
        Game.Images[Object.keys(Sprites)[i]].src = Sprites[i + 1];

        /*Game.Images[Object.keys(Sprites)[i]].onload = function () {
          Game.Images[Object.keys(Sprites)[i]].Load = true;
          console.log(Game.Images[Object.keys(Sprites)[i]].src + ' Loaded');
        };*/
      }
      init();
    });
    Game.io.on('disconnect', function (e) {
      console.log('Socket disconnected; ' + e);
      window.cancelAnimationFrame(Game.requestAnimationFrame);
      Game.disconnected = true;
    });
  });
};
window.onload = main;
