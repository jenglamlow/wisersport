
'use strict';

const expect = require('chai').expect;
const Team = require('../src/team');

describe('Team', function () {
  describe('Initialization', function () {
    it('Check state', function () {
      // Default value
      let r = new Team('Red', 'r');

      expect(r.state.name).to.equal('Red');
      expect(r.state.color).to.equal('r');
      expect(r.state.balls).to.have.lengthOf(7);

      // Pass in parameter
      r = new Team('White', 'w', 4);

      expect(r.state.name).to.equal('White');
      expect(r.state.color).to.equal('w');
      expect(r.state.balls).to.have.lengthOf(4);
    });
  });

  describe('Clear', function () {
    it('Check state', function () {
      // Default value
      let r = new Team('Red', 'r');

      r.ball[0].hit('w3');

      expect(r.state.balls[0].hit).to.have.ordered.members(['w3']);

      r.clear();
      expect(r.state.balls[0].hit).to.be.empty;
    });
  });
});
