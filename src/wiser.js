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
          const rescue = this[t.team].balls[t.idx].getHitBy(s.label);
        } else {
          // Miss Hit
        }
      } else {
        // Foul input action
      }

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
