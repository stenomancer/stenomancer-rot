var Game = {
  display: null,
  map: {},
  engine: null,
  player: null,
  items: [],

  init: function() {
    this.display = new ROT.Display();
    document.body.appendChild(this.display.getContainer());

    this._generateMap();

    var scheduler = new ROT.Scheduler.Simple();
    scheduler.add(this.player, true);

    this.engine = new ROT.Engine(scheduler);
    this.engine.start();
  },

  _generateMap: function() {
    var digger = new ROT.Map.Digger();
    var freeCells = [];

    var digCallback = function(x, y, value) {
      if (value) { return; }

      var key = x+","+y;
      this.map[key] = ".";
      freeCells.push(key);
    }
    digger.create(digCallback.bind(this));

    this._drawWholeMap();
    this._generateKeys(freeCells);
    this._createPlayer(freeCells);
  },

  _createPlayer: function(freeCells) {
    var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    var key = freeCells.splice(index, 1)[0];
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    this.player = new Player(x, y);
  },

  _generateKeys: function(freeCells) {
    const stenographyKeys = [
      'S', 'S', 'T', 'K', 'P', 'W', 'H', 'R', '*', '*', 'F', 'R', 'P', 'B',
      'L', 'G', 'T', 'S', 'D', 'Z', 'A', 'O', 'E', 'U'
    ]

    stenographyKeys.forEach((key) => {
      var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
      var position = freeCells.splice(index, 1)[0];
      var parts = position.split(",");
      var x = parseInt(parts[0]);
      var y = parseInt(parts[1]);
      this.items.push(new Item(x, y, key));
    });
  },

  _drawWholeMap: function() {
    for (var key in this.map) {
      var parts = key.split(",");
      var x = parseInt(parts[0]);
      var y = parseInt(parts[1]);
      this.display.draw(x, y, this.map[key]);
    }
  }
};

var Item = function(x, y, symbol) {
  this._x = x;
  this._y = y;
  this._symbol = symbol;
  this._draw();
}

var Player = function(x, y) {
  this._x = x;
  this._y = y;
  this._draw();
}

Item.prototype._draw = function() {
  Game.display.draw(this._x, this._y, this._symbol, "#9932CC");
}

Player.prototype.act = function() {
  Game.engine.lock();
  window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function(e) {
  var keyMap = {};
  keyMap[38] = 0;
  keyMap[33] = 1;
  keyMap[39] = 2;
  keyMap[34] = 3;
  keyMap[40] = 4;
  keyMap[35] = 5;
  keyMap[37] = 6;
  keyMap[36] = 7;

  var code = e.keyCode;
  /* one of numpad directions? */
  if (!(code in keyMap)) { return; }

  /* is there a free space? */
  var dir = ROT.DIRS[8][keyMap[code]];
  var newX = this._x + dir[0];
  var newY = this._y + dir[1];
  var newKey = newX + "," + newY;
  if (!(newKey in Game.map)) { return; }

  Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
  this._x = newX;
  this._y = newY;
  this._draw();
  window.removeEventListener("keydown", this);
  Game.engine.unlock();
}

Player.prototype._draw = function() {
  Game.display.draw(this._x, this._y, "@", "#ff0");
}

Game.init();

