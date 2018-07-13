
'use strict';

const expect = require('chai').expect;
const Ball = require('../src/ball');

describe('Ball', function () {
  describe('Initialization', function () {
    it('Check initialization value', function () {
      const b = new Ball('w', 5);

      expect(b.state.color).to.equal('w');
      expect(b.state.number).to.equal(5);
    });
  });

  describe('Clear', function () {
    const b = new Ball('w', 7);
    it('Clear internal state', function () {
      b.hit('w3');
      b.clear();

      expect(b.state.hit).to.be.an('array').that.is.empty;
      expect(b.state.activeHit).to.be.an('array').that.is.empty;
      expect(b.state.hitBy).to.be.an('array').that.is.empty;
      expect(b.state.foul).to.equal(0);
      expect(b.state.status).to.equal(0);
    });

    it('Color and number remain', function () {
      expect(b.state.color).to.equal('w');
      expect(b.state.number).to.equal(7);
    });
  });

  describe('Hit', function () {
    const b = new Ball('r', 7);

    it('Check hit list and active hit list', function () {
      b.hit('r7');

      expect(b.state.hit).to.have.ordered.members(['r7']);
      expect(b.state.activeHit).to.have.ordered.members(['r7']);

      b.hit('r6');
      expect(b.state.hit).to.have.ordered.members(['r7', 'r6']);
      expect(b.state.activeHit).to.have.ordered.members(['r7', 'r6']);
    });
  });

  describe('Hit By', function () {
    const b = new Ball('r', 7);

    beforeEach(function () {
      b.clear();
    });

    it('Check hitBy list and status', function () {
      b.hitBy('w7');
      expect(b.state.status).to.equal(1);
      expect(b.state.hitBy).to.have.ordered.members(['w7']);

      b.hitBy('w6');
      expect(b.state.status).to.equal(2);
      expect(b.state.hitBy).to.have.ordered.members(['w7', 'w6']);

      b.hitBy('w5');
      expect(b.state.status).to.equal(3);
      expect(b.state.hitBy).to.have.ordered.members(['w7', 'w6', 'w5']);

      // Status capped at 3
      expect(function () { b.hitBy('w7'); }).to.be.throw('Already eliminated!');
      expect(b.state.status).to.equal(3);
    });

    it('Check rescue', function () {
      b.hit('r2');
      b.hit('r1');
      b.hit('r4');

      let rescue = b.hitBy('w7');
      expect(rescue).to.equal('r2');
      expect(b.state.status).to.equal(1);
      expect(b.state.hitBy).to.have.ordered.members(['w7']);

      rescue = b.hitBy('w6');
      expect(rescue).to.equal('r1');
      expect(b.state.status).to.equal(2);
      expect(b.state.hitBy).to.have.ordered.members(['w7', 'w6']);

      rescue = b.hitBy('w5');
      expect(rescue).to.equal('r4');
      expect(b.state.status).to.equal(3);
      expect(b.state.hitBy).to.have.ordered.members(['w7', 'w6', 'w5']);
    });

    it('Check rescue null return', function () {
      b.hit('r2');
      b.hit('r1');

      let rescue = b.hitBy('w7');
      expect(rescue).to.equal('r2');
      expect(b.state.status).to.equal(1);
      expect(b.state.hitBy).to.have.ordered.members(['w7']);

      rescue = b.hitBy('w6');
      expect(rescue).to.equal('r1');
      expect(b.state.status).to.equal(2);
      expect(b.state.hitBy).to.have.ordered.members(['w7', 'w6']);

      rescue = b.hitBy('w5');
      expect(rescue).to.be.null;
      expect(b.state.status).to.equal(3);
    });
  });

  describe('Foul', function () {
    const b = new Ball('r', 7);

    it('Check foul increment', function () {
      b.foul();

      expect(b.state.foul).to.equal(1);

      b.clear();
      expect(b.state.foul).to.equal(0);
    });
  });
});
