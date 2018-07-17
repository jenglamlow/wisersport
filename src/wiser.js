(function (root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.returnExports = factory();
  }
}(this, function () {
  'user strict';
  const Team = require('./team');

  // Constructor
  let Wiser = function (redName = 'Red', whiteName = 'White', num = 7) {
    this.r = new Team(redName, 'r', num);
    this.w = new Team(whiteName, 'w', num);
    this.sequence = [];
  };

  Wiser.prototype = {

  // ==========================================================================
  // Public Function
  // ==========================================================================
    rescue: function (ball) {
      const team = ball[0];
      const idx = parseInt(ball[1]) - 1;

      if (ball.length < 3) {
        this[team].balls[idx].rescue();
      } else {
        // Rescue Miss Hit
        this[team].balls[idx].rescueMissHit();
      }
    },

    updateScore: function () {
      const team = ['r', 'w'];

      team.forEach(t => {
        let total = this[t].getTotalContesting() * 5 +
          this[t].getTotalFirstLock() * 2 +
          this[t].getTotalSecondLock();
        this[t].score = total;
      });
    },

    process: function (input) {
      // Check length
      if (input.length !== 4) {
        throw new Error('Input length must be length of 4');
      }

      const re = /([rw])([t1-7])([frw])([mx1-7])/g;
      const match = re.exec(input);

      // Validate Input
      if (!match) {
        throw new Error('Invalid input parameter');
      }

      // Check whether is foul mode
      let mode = 'n';
      if (match[3] === 'f') {
        if ((match[4] !== 'm') || (match[4] !== 'x')) {
          throw new Error('Invalid input parameter');
        }
        mode = 'f';
      }

      const s = {
        label: match[1] + match[2],
        team: match[1],
        idx: parseInt(match[2]) - 1
      };

      if (mode === 'n') {
        // Normal input action
        const t = {
          label: match[3] + match[4],
          team: match[3],
          idx: parseInt(match[4]) - 1
        };

        // Proper Hit
        if (s.team !== t.team) {
          this[s.team].balls[s.idx].hit(t.label);
          const rescueBall = this[t.team].balls[t.idx].getHitBy(s.label);

          // If the target is eliminated, remove the target from active hit list
          if (this[t.team].balls[t.idx].isEliminated()) {
            this[s.team].balls[s.idx].removeActiveTargetHit(t.label);

            // Remove pending rescue as well for eliminated ball and miss hit ball
            this[s.team].removePendingRescueTarget(t.label);
            this[s.team].removePendingRescueTarget(t.label + 'm');
          }

          if (rescueBall) {
            // If there is a rescue ball after hit
            this.rescue(rescueBall);

            // If the target ball eliminated, check any pending hit
            // and transfer over to team pending active hits
            if (this[t.team].balls[t.idx].isEliminated()) {
              if (this[t.team].balls[t.idx].activeHits.length > 0) {
                this[t.team].pendingRescue.push(...this[t.team].balls[t.idx].activeHits);
              }
            }
          } else {
            // Check any pending team pending active hits or miss hits rescue
            if (this[t.team].pendingRescue.length > 0) {
              const rescueBall = this[t.team].pendingRescue.shift();
              this.rescue(rescueBall);
            }
          }
        } else {
          // Miss Hit save target first
          this[s.team].balls[s.idx].missHit(t.label);
          this[t.team].balls[t.idx].getMissHitBy(s.label);

          // Store the rescue order in opponet pending list
          const opponent = t.team === 'r' ? 'w' : 'r';
          if (!this[t.team].balls[t.idx].isEliminated()) {
            this[opponent].pendingRescue.push(t.label + 'm');
          }
          this[opponent].pendingRescue.push(s.label + 'm');
        }
      } else {
        // Foul input action
      }

      // Update score
      this.updateScore();

      this.sequence.push(input);
    },

    clear: function () {
      this.sequence = [];
      this.r.clear();
      this.w.clear();
    }
  };

  return Wiser;
}));
