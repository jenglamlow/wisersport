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

  let Wiser = function (redTeam, whiteTeam, ball = 7, start = 'r') {
    this.redTeam = redTeam;
    this.whiteTeam = whiteTeam;
  };

  Wiser.prototype = {
    info: function () {
      console.log('info');
    },

    process: function (input) {
      if ((input.length >= 3) && (input.length <= 4)) {
      } else {
        throw new Error('Input length must in the range of 3-4');
      }
    },

    clear: function () {
    }
  };

  return Wiser;
}));
