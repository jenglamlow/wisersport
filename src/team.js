const Ball = require('./ball');

let Team = function (name, color, num = 7) {
  this.ball = [];
  const ballState = [];

  // Initialize Ball Object
  for (let i = 0; i < num; i++) {
    let b = new Ball(color, i + 1);
    this.ball.push(b);
    ballState.push(b.state);
  }

  this.state = {
    name: name,
    color: color,
    score: 0,
    balls: ballState
  };
};

Team.prototype = {
  info: function () {
    return this.state;
  },

  clear: function () {
    this.state.score = 0;

    for (let ball of this.ball) {
      ball.clear();
    }
  }
};

module.exports = Team;
