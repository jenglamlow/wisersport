let Ball = function (color, number) {
  this.state = {
    number: number,
    color: color,
    status: 0,
    foul: 0,
    hit: [],
    activeHit: [],
    hitBy: []
  };
};

Ball.prototype = {
  info: function () {
    return this.state;
  },

  hit: function (ball) {
    this.state.hit.push(ball);
    this.state.activeHit.push(ball);
  },

  hitBy: function (ball) {
    if (this.state.status < 3) {
      this.state.hitBy.push(ball);
      this.state.status++;

      // Get rescue list
      if (this.state.activeHit.length > 0) {
        return this.state.activeHit.shift();
      } else {
        return null;
      }
    } else {
      throw new Error('Already eliminated!');
    }
  },

  rescue: function () {
    if ((this.state.status > 0) && (this.state.status < 3)) {
      this.state.hitBy.shift();
    } else {
      if (this.state.status === 3) {
        throw new Error('Already eliminated! Cannot be rescued');
      } else if (this.state.status === 0) {
        throw new Error('It is not locked!');
      }
    }
  },

  clear: function () {
    this.state.status = 0;
    this.state.foul = 0;
    this.state.hit = [];
    this.state.activeHit = [];
    this.state.hitBy = [];
  }
};

module.exports = Ball;
