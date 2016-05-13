module.exports = {
  server: {
    socket: { port: 3000 },
    express: { port: 2000 }
  },
  Objects: {
    Player: {
      width: 75,
      height: 100,
      Default: {
        speed: 2
      }
    },
    Block: {
      width: 50,
      height: 50
    }
  },
  Map: {
    FRAMERATE: 60
  }
};
