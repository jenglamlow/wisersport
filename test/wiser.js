
'use strict';

const expect = require('chai').expect;
const Wiser = require('../src');

describe('Wiser Game', function () {
  describe('Initialization', function () {
    it('Check initialization value', function () {
      let wiser = new Wiser('Red', 'White');

      expect(wiser.state.red.name).to.equal('Red');
      expect(wiser.state.white.name).to.equal('White');
      expect(wiser.state.red.balls).to.have.lengthOf(7);
      expect(wiser.state.white.balls).to.have.lengthOf(7);

      wiser = new Wiser('Eagle', 'Falcon', 5);

      expect(wiser.state.red.name).to.equal('Eagle');
      expect(wiser.state.white.name).to.equal('Falcon');
      expect(wiser.state.red.balls).to.have.lengthOf(5);
      expect(wiser.state.white.balls).to.have.lengthOf(5);
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

  describe('Hit', function () {
    let wiser = new Wiser('Red', 'White');

    beforeEach(function () {
    // Clear internal state
      wiser.clear();
    });

    it('Normal Hit', function () {
      wiser.process('r1w1');
    });
  });
});
