let Ball = function (color, number) {
  this.number = number;
  this.color = color;
  this.status = 0;
  this.foul = 0;
  this.hits = [];
  this.activeHits = [];
  this.hitBy = [];
};

Ball.prototype = {
  hit: function (ball) {
    this.hits.push(ball);
    this.activeHits.push(ball);
  },

  getHitBy: function (ball) {
    if (this.status < 3) {
      this.hitBy.push(ball);
      this.status++;

      // Get rescue list
      if (this.activeHits.length > 0) {
        return this.activeHits.shift();
      } else {
        return null;
      }
    } else {
      throw new Error('Already eliminated!');
    }
  },

  rescue: function () {
    if ((this.status > 0) && (this.status < 3)) {
      this.status--;
      this.hitBy.shift();
    } else {
      if (this.status === 3) {
        throw new Error('Already eliminated! Cannot be rescued');
      } else if (this.status === 0) {
        throw new Error('It is not locked!');
      }
    }
  },

  isContesting: function () {
    return this.status === 0;
  },

  commitFoul: function () {
    this.foul++;
  },

  clear: function () {
    this.status = 0;
    this.foul = 0;
    this.hits = [];
    this.activeHits = [];
    this.hitBy = [];
  }
};

module.exports = Ball;
