
'use strict';

const expect = require('chai').expect;
const Wiser = require('../src');

describe('Wiser Game', function () {
  describe('Initialization', function () {
    it('Check initialization value', function () {
      let wiser = new Wiser('Red', 'White');

      expect(wiser.r.name).to.equal('Red');
      expect(wiser.w.name).to.equal('White');
      expect(wiser.r.balls).to.have.lengthOf(7);
      expect(wiser.w.balls).to.have.lengthOf(7);

      wiser = new Wiser('Eagle', 'Falcon', 5);

      expect(wiser.r.name).to.equal('Eagle');
      expect(wiser.w.name).to.equal('Falcon');
      expect(wiser.r.balls).to.have.lengthOf(5);
      expect(wiser.w.balls).to.have.lengthOf(5);
    });
  });

  describe('Processing Input', function () {
    let wiser = new Wiser('Red', 'White');

    beforeEach(function () {
    // Clear internal state
      wiser.clear();
    });

    it('input length', function () {
      const errorMsg = 'Input length must be length of 4';
      const badInput = ['', 'r', 'r1', 'r1r2x', 'r1f'];

      for (const s of badInput) {
        expect(function () {
          wiser.process(s);
        }).to.throw(errorMsg);
      }
    });

    it('input validation', function () {
      const errorMsg = 'Invalid input parameter';
      const badInput = ['d1d2', 'r8w9', 'w0r9', 'k1r2', 'rtff', 'wtfs', 'rtf1'];

      for (const s of badInput) {
        expect(function () {
          wiser.process(s);
        }).to.throw(errorMsg);
      }
    });
  });

  describe('Clear', function () {
    it('Clear sequence, team and ball state', function () {
      let wiser = new Wiser('Red', 'White');

      wiser.process('r1w1');
      wiser.process('r2w2');
      wiser.process('r3w3');

      wiser.clear();
      expect(wiser.sequence).to.be.an('array').that.is.empty;
    });
  });

  describe('Hit', function () {
    let wiser = new Wiser('Red', 'White');

    beforeEach(function () {
    // Clear internal state
      wiser.clear();
    });

    it('Normal Hit', function () {
      // First Lock
      wiser.process('r1w1');

      expect(wiser.sequence).to.have.ordered.members(['r1w1']);

      // Second Lock
      wiser.process('r2w1');

      expect(wiser.sequence).to.have.ordered.members(['r1w1', 'r2w1']);

      // Strike Out
      wiser.process('r1w1');

      expect(wiser.sequence).to.have.ordered.members(['r1w1', 'r2w1', 'r1w1']);

      // Hit the eliminated ball again should trigger error
      expect(function () { wiser.process('r1w1'); }).to.be.throw('w1 is already eliminated!');
    });

    it('Ball cannot attack when it is not contesting ball', function () {
      // First Lock
      wiser.process('r1w1');

      expect(function () { wiser.process('w1r2'); }).to.be.throw('w1 is not contesting ball. Cannot hit!');
    });

    it('Ball cannot hit eliminated ball', function () {
      // First Lock
      wiser.process('r1w1');
      wiser.process('r1w1');
      wiser.process('r1w1');

      expect(function () { wiser.process('r1w1'); }).to.be.throw('w1 is already eliminated!');
    });
  });
});
