let Ball = function (label) {
  this.label = label;
  this.status = 0;
  this.foul = 0;
  this.hits = [];
  this.activeHits = [];
  this.hitBy = [];
};

Ball.prototype = {
  hit: function (ball) {
    if (this.status === 0) {
      this.hits.push(ball);
      this.activeHits.push(ball);
    } else {
      throw new Error(this.label + ' is not contesting ball. Cannot hit!');
    }
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
      throw new Error(this.label + ' is already eliminated!');
    }
  },

  rescueMissHit () {
    if ((this.status > 0) && (this.status < 3)) {
      this.status--;

      // Look for first miss hit
      for (let i in this.hitBy) {
        if (this.hitBy[i].match(new RegExp(this.label[0] + '[0-7]', 'g'))) {
          this.hitBy.splice(i, 1);
          break;
        }
      }
    } else {
      if (this.status === 3) {
        throw new Error(this.label + ' is already eliminated! Cannot be rescued');
      } else {
        // It is contesting ball
        throw new Error(this.label + ' is not locked!');
      }
    }
  },

  rescue: function () {
    if ((this.status > 0) && (this.status < 3)) {
      this.status--;
      this.hitBy.shift();
    } else {
      if (this.status === 3) {
        throw new Error(this.label + ' is already eliminated! Cannot be rescued');
      } else {
        // It is contesting ball
        throw new Error(this.label + ' is not locked!');
      }
    }
  },

  removeActiveTargetHit: function (target) {
    this.activeHits = this.activeHits.filter(item => item !== target);
  },

  isEliminated: function () {
    return this.status === 3;
  },

  isContesting: function () {
    return this.status === 0;
  },

  isLocked: function () {
    return (this.status === 1 || this.status === 2);
  },

  missHit: function (target, penalty = 3) {
    if (this.status === 0) {
      this.status += penalty;
      this.hits.push(target);
    } else {
      throw new Error(this.label + ' is not contesting ball. Cannot missHit!');
    }
  },

  getMissHitBy: function (ball) {
    if (this.status < 3) {
      this.hitBy.push(ball);
      this.status++;
    } else {
      throw new Error(this.label + ' is already eliminated!');
    }
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
