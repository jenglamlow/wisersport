
'use strict';

const expect = require('chai').expect;
const Team = require('../src/team');

describe('Team', function () {
  describe('Initialization', function () {
    it('Check internal state', function () {
      // Default value
      let r = new Team('Red', 'r');

      expect(r.name).to.equal('Red');
      expect(r.color).to.equal('r');
      expect(r.balls).to.have.lengthOf(7);

      // Pass in parameter
      r = new Team('White', 'w', 4);

      expect(r.name).to.equal('White');
      expect(r.color).to.equal('w');
      expect(r.balls).to.have.lengthOf(4);
    });
  });

  describe('Clear', function () {
    it('Check state', function () {
      // Default value
      let r = new Team('Red', 'r');

      r.balls[0].hit('w3');

      r.clear();
      expect(r.score).to.equal(0);
    });
  });
});
