const Ball = require('./ball');

let Team = function (name, color, num = 7) {
  const balls = [];

  // Initialize Ball Object
  for (let i = 0; i < num; i++) {
    let b = new Ball(color + (i + 1).toString());
    balls.push(b);
  }

  this.name = name;
  this.color = color;
  this.score = balls.length * 5;
  this.balls = balls;
  this.pendingRescue = [];
};

Team.prototype = {
  getTotalContesting: function () {
    return this.balls.filter(item => item.status === 0).length;
  },

  getTotalFirstLock: function () {
    return this.balls.filter(item => item.status === 1).length;
  },

  getTotalSecondLock: function () {
    return this.balls.filter(item => item.status === 2).length;
  },

  getTotalEliminated: function () {
    return this.balls.filter(item => item.status === 3).length;
  },

  clear: function () {
    this.score = this.balls.length * 5;
    this.pendingRescue = [];

    this.balls.forEach(item => {
      item.clear();
    });
  }
};

module.exports = Team;
