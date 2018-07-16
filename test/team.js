
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
      expect(r.score).to.equal(35);
      expect(r.getTotalContesting()).to.equal(7);
    });
  });

  describe('Get Status', function () {
    it('Contesting Ball', function () {
      // Default value
      let r = new Team('Red', 'r');

      r.balls[0].getHitBy('w3');

      expect(r.getTotalContesting()).to.equal(6);

      r.balls[1].getHitBy('w3');

      expect(r.getTotalContesting()).to.equal(5);
    });

    it('First Lock', function () {
      // Default value
      let r = new Team('Red', 'r');

      r.balls[0].getHitBy('w3');

      expect(r.getTotalFirstLock()).to.equal(1);

      r.balls[1].getHitBy('w3');

      expect(r.getTotalFirstLock()).to.equal(2);
    });

    it('Second Lock', function () {
      // Default value
      let r = new Team('Red', 'r');

      r.balls[0].getHitBy('w3');

      expect(r.getTotalFirstLock()).to.equal(1);

      r.balls[0].getHitBy('w3');

      expect(r.getTotalFirstLock()).to.equal(0);
      expect(r.getTotalSecondLock()).to.equal(1);
    });

    it('Eliminated', function () {
      // Default value
      let r = new Team('Red', 'r');

      r.balls[0].getHitBy('w3');

      expect(r.getTotalFirstLock()).to.equal(1);

      r.balls[0].getHitBy('w3');

      expect(r.getTotalFirstLock()).to.equal(0);
      expect(r.getTotalSecondLock()).to.equal(1);

      r.balls[0].getHitBy('w3');

      expect(r.getTotalFirstLock()).to.equal(0);
      expect(r.getTotalSecondLock()).to.equal(0);
      expect(r.getTotalEliminated()).to.equal(1);
    });
  });
});
