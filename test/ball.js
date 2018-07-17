
'use strict';

const expect = require('chai').expect;
const Ball = require('../src/ball');

describe('Ball', function () {
  describe('Initialization', function () {
    it('Check initialization value', function () {
      const b = new Ball('w5');

      expect(b.label).to.equal('w5');
    });
  });

  describe('Clear', function () {
    const b = new Ball('w7');
    it('Clear internal state', function () {
      b.hit('w3');
      b.clear();

      expect(b.hits).to.be.an('array').that.is.empty;
      expect(b.activeHits).to.be.an('array').that.is.empty;
      expect(b.hitBy).to.be.an('array').that.is.empty;
      expect(b.foul).to.equal(0);
      expect(b.status).to.equal(0);
    });

    it('Label remain', function () {
      expect(b.label).to.equal('w7');
    });
  });

  describe('Hit', function () {
    const b = new Ball('r7');

    it('Check hit list and active hit list', function () {
      b.hit('r7');

      expect(b.hits).to.have.ordered.members(['r7']);
      expect(b.activeHits).to.have.ordered.members(['r7']);

      b.hit('r6');
      expect(b.hits).to.have.ordered.members(['r7', 'r6']);
      expect(b.activeHits).to.have.ordered.members(['r7', 'r6']);
    });
  });

  describe('Hit By', function () {
    const b = new Ball('r7');

    beforeEach(function () {
      b.clear();
    });

    it('Check hitBy list and status', function () {
      b.getHitBy('w7');
      expect(b.status).to.equal(1);
      expect(b.isContesting()).to.be.false;
      expect(b.hitBy).to.have.ordered.members(['w7']);

      b.getHitBy('w6');
      expect(b.status).to.equal(2);
      expect(b.isContesting()).to.be.false;
      expect(b.hitBy).to.have.ordered.members(['w7', 'w6']);

      b.getHitBy('w5');
      expect(b.status).to.equal(3);
      expect(b.isContesting()).to.be.false;
      expect(b.isEliminated()).to.be.true;
      expect(b.hitBy).to.have.ordered.members(['w7', 'w6', 'w5']);

      // Status capped at 3
      expect(function () { b.getHitBy('w7'); }).to.be.throw('r7 is already eliminated!');
      expect(b.status).to.equal(3);
    });

    it('Check rescue', function () {
      b.hit('r2');
      b.hit('r1');
      b.hit('r4');

      let rescue = b.getHitBy('w7');
      expect(rescue).to.equal('r2');
      expect(b.status).to.equal(1);
      expect(b.hitBy).to.have.ordered.members(['w7']);

      rescue = b.getHitBy('w6');
      expect(rescue).to.equal('r1');
      expect(b.status).to.equal(2);
      expect(b.hitBy).to.have.ordered.members(['w7', 'w6']);

      rescue = b.getHitBy('w5');
      expect(rescue).to.equal('r4');
      expect(b.status).to.equal(3);
      expect(b.hitBy).to.have.ordered.members(['w7', 'w6', 'w5']);
    });

    it('Check rescue null return', function () {
      b.hit('r2');
      b.hit('r1');

      let rescue = b.getHitBy('w7');
      expect(rescue).to.equal('r2');
      expect(b.status).to.equal(1);
      expect(b.hitBy).to.have.ordered.members(['w7']);

      rescue = b.getHitBy('w6');
      expect(rescue).to.equal('r1');
      expect(b.status).to.equal(2);
      expect(b.hitBy).to.have.ordered.members(['w7', 'w6']);

      rescue = b.getHitBy('w5');
      expect(rescue).to.be.null;
      expect(b.status).to.equal(3);
    });
  });

  describe('Rescue', function () {
    const b = new Ball('r7');
    beforeEach(function () {
      b.clear();
    });

    it('Get rescue', function () {
      b.getHitBy('w5');
      expect(b.isContesting()).to.be.false;
      expect(b.hitBy).to.have.ordered.members(['w5']);

      b.rescue();
      expect(b.isContesting()).to.be.true;
      expect(b.hitBy).to.be.an('array').that.is.empty;
    });

    it('Contesting ball calling rescue should trigger error', function () {
      expect(function () { b.rescue(); }).to.be.throw('r7 is not locked!');
    });

    it('Eliminated Ball cannot be rescue', function () {
      b.getHitBy('w6');
      b.getHitBy('w6');
      b.getHitBy('w6');
      expect(function () { b.rescue(); }).to.be.throw('r7 is already eliminated! Cannot be rescued');
    });
  });

  describe('Foul', function () {
    const b = new Ball('r7');

    it('Check foul increment', function () {
      b.commitFoul();

      expect(b.foul).to.equal(1);

      b.clear();
      expect(b.foul).to.equal(0);
    });
  });
});
