const Ball = require('./ball');

let Team = function (name, color, num = 7) {
  const balls = [];

  // Initialize Ball Object
  for (let i = 0; i < num; i++) {
    let b = new Ball(color, i + 1);
    balls.push(b);
  }

  this.name = name;
  this.color = color;
  this.score = 0;
  this.balls = balls;
};

Team.prototype = {
  clear: function () {
    this.score = 0;

    this.balls.forEach(item => {
      item.clear();
    });
  }
};

module.exports = Team;
