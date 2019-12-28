var model = {
  boardSize: 8,
  numShips: 3,
  shipLength: 3,
  playerOneTurn: true,
  startNewGame: false,
  freeze: true,
  playerOne: null,
  playerTwo: null,

  initialPlayers: function() {
    this.playerOne = {
      ships: [
        { locations: [0, 0, 0], hits: ["", "", ""] },
        { locations: [0, 0, 0], hits: ["", "", ""] },
        { locations: [0, 0, 0], hits: ["", "", ""] }
      ],
      shipsSunk: 0,
      shipsHit: 0,
      shipsAlive: 3
    };

    this.playerTwo = {
      ships: [
        { locations: [0, 0, 0], hits: ["", "", ""] },
        { locations: [0, 0, 0], hits: ["", "", ""] },
        { locations: [0, 0, 0], hits: ["", "", ""] }
      ],
      shipsSunk: 0,
      shipsHit: 0,
      shipsAlive: 3
    };
  },

  getPlayerData: function(player, data) {
    switch (data) {
      case "shipsAlive":
        return player.shipsAlive;
      case "shipsHit":
        return player.shipsHit;
      case "shipsSunk":
        return player.shipsSunk;
    }
  },

  fire: function(guess, player) {
    this.playerOneTurn = player == this.playerOne ? false : true;
    for (var i = 0; i < this.numShips; i++) {
      var ship = player.ships[i];
      var index = ship.locations.indexOf(guess);
      // check if a ship location has already been hit
      if (ship.hits[index] === "hit") {
        view.displayMessage(player, "already hit");
        return;
      } else if (index >= 0) {
        ship.hits[index] = "hit";
        view.displayHit(guess);
        view.displayMessage(player, "hit");
        player.shipsHit++;
        if (this.isSunk(ship)) {
          view.displayMessage(player, "sunk");
          player.shipsSunk++;
          player.shipsAlive--;
        }
        view.render();
        return;
      }
    }
    view.displayMiss(guess);
    view.displayMessage(player, "missed");
    view.render();
  },

  isSunk: function(ship) {
    for (var i = 0; i < this.shipLength; i++) {
      if (ship.hits[i] !== "hit") {
        return false;
      }
    }
    return true;
  },

  generateShipLocations: function(player) {
    var locations;
    for (var i = 0; i < this.numShips; i++) {
      do {
        locations = this.generateShip(player);
      } while (this.collision(locations, player));
      player.ships[i].locations = locations;
    }
  },

  generateShip: function(player) {
    var direction = Math.floor(Math.random() * 2);
    var row, col;
    playerId = player == this.playerOne ? "p1" : "p2";

    if (direction === 1) {
      // horizontal
      row = Math.floor(Math.random() * this.boardSize);
      col = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
    } else {
      // vertical
      row = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
      col = Math.floor(Math.random() * this.boardSize);
    }

    var newShipLocations = [];

    for (var i = 0; i < this.shipLength; i++) {
      if (direction === 1) {
        newShipLocations.push(playerId + (row + "" + (col + i)));
      } else {
        newShipLocations.push(playerId + (row + i + "" + col));
      }
    }
    return newShipLocations;
  },

  collision: function(locations, player) {
    for (var i = 0; i < this.numShips; i++) {
      var ship = player.ships[i];
      for (var j = 0; j < locations.length; j++) {
        if (ship.locations.indexOf(locations[j]) >= 0) {
          return true;
        }
      }
    }
    return false;
  },

  reset: function() {
    this.initialPlayers();
    controller.init();
  }
};

var controller = {
  userTableCreate: function(playerMap, playerId, player) {
    var rows = 8;
    var cols = 8;
    var table = document.getElementById(playerMap);
    table.innerHTML = "";
    table.style.marginBottom = "50px";
    for (var r = 0; r < rows; r++) {
      var row = table.insertRow(-1);
      for (var c = 0; c < cols; c++) {
        var cell = row.insertCell(-1);
        cell.setAttribute(
          "id",
          playerId + "01234567".charAt(r) + "01234567".charAt(c)
        );
        cell.setAttribute("class", "cell");
      }
    }

    for (var i = 0; i < table.rows.length; i++) {
      for (var j = 0; j < table.rows[i].cells.length; j++)
        table.rows[i].cells[j].onclick = model.freeze
          ? null
          : controller.processGuess;
    }
    model.generateShipLocations(player);
  },

  createTables: function() {
    this.userTableCreate("playerOne-map", "p2", model.playerOne);
    this.userTableCreate("playerTwo-map", "p1", model.playerTwo);
  },

  processGuess: function() {
    if (model.freeze) {
      view.windowAlert("Game is over. Please start a NEW GAME");
      return;
    }
    var location = this.id;
    var playerId = location.substring(0, 2);
    player = playerId == "p1" ? model.playerOne : model.playerTwo;
    if (model.playerOneTurn && player == model.playerTwo) {
      view.windowAlert(
        "It is Player One's turn to attack Player Two's Territorial Waters!"
      );
      return;
    } else if (!model.playerOneTurn && player == model.playerOne) {
      view.windowAlert(
        "It is Player Two's turn! to attack Player Two's Territorial Waters"
      );
      return;
    }
    if (location) {
      model.fire(location, player);
      if (player.shipsSunk === model.numShips) {
        view.displayMessage(player, "won");
        model.startNewGame = false;
        model.freeze = true;
        view.render();
      }
    }
  },

  init() {
    model.initialPlayers();
    this.createTables();
    view.render();
  },

  startNew: function() {
    model.startNewGame = true;
    model.freeze = false;
    model.reset();
  }
};

var view = {
  displayMessage: function(player, msg) {
    if (player == model.playerOne) {
      if (msg == "already hit") {
        msg = "Oops, Player one already hit that location. Do not waste fires.";
      } else if (msg == "hit") {
        msg = "Player one hit Player two's ship";
      } else if (msg == "sunk") {
        msg = "Player one sank Player two's battleship!";
      } else if (msg == "missed") {
        msg = "Player one missed it";
      } else if (msg == "won") {
        msg = "Player one won";
      }
    } else if (player == model.playerTwo) {
      if (msg == "already hit") {
        msg = "Oops, Player two already hit that location. Do not waste fires.";
      } else if (msg == "hit") {
        msg = "Player two hit Player one's ship";
      } else if (msg == "sunk") {
        msg = "Player two sank Player one's battleship!";
      } else if (msg == "missed") {
        msg = "Player two missed it";
      } else if (msg == "won") {
        msg = "Player two won";
      }
    }
    var messageArea = document.getElementById("display-msg");
    messageArea.innerHTML = msg;
  },

  displayHit: function(location) {
    var cell = document.getElementById(location);
    cell.setAttribute("class", "hit");
  },

  displayMiss: function(location) {
    var cell = document.getElementById(location);
    cell.setAttribute("class", "miss");
  },

  windowAlert: function(msg) {
    window.alert(msg);
  },

  render: function() {
    let p1_ship_alive = document.getElementById("p1-ship-alive");
    let p1_ship_hit = document.getElementById("p1-ship-hit");
    let p1_ship_sunk = document.getElementById("p1-ship-sunk");
    let p2_ship_alive = document.getElementById("p2-ship-alive");
    let p2_ship_hit = document.getElementById("p2-ship-hit");
    let p2_ship_sunk = document.getElementById("p2-ship-sunk");
    let p1 = model.playerOne;
    let p2 = model.playerTwo;
    let player_turn = document.getElementById("player-turn");
    var start_new = document.getElementById("start-new");
    player_turn.innerHTML = "";
    start_new.style.display = model.startNewGame ? "NONE" : "inline-block";
    start_new.onclick = controller.startNew;
    if (model.startNewGame) {
      player_turn.innerHTML = model.playerOneTurn
        ? "Player One's Turn to attack Player Two's Territory"
        : "Player Two's Turn to attack Player One's Territory";
    }
    p1_ship_alive.innerHTML = model.getPlayerData(p2, "shipsAlive");
    p1_ship_hit.innerHTML = model.getPlayerData(p2, "shipsHit");
    p1_ship_sunk.innerHTML = model.getPlayerData(p2, "shipsSunk");
    p2_ship_alive.innerHTML = model.getPlayerData(p1, "shipsAlive");
    p2_ship_hit.innerHTML = model.getPlayerData(p1, "shipsHit");
    p2_ship_sunk.innerHTML = model.getPlayerData(p1, "shipsSunk");
  }
};

window.onload = init;

function init() {
  controller.init();
}
