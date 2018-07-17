
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

  describe('Rescue', function () {
    let wiser = new Wiser('Red', 'White');

    beforeEach(function () {
    // Clear internal state
      wiser.clear();
    });

    it('Normal Rescue', function () {
      // First Lock
      wiser.process('r1w1');
      expect(wiser.w.balls[0].status).to.equal(1);

      wiser.process('w3r1');
      expect(wiser.w.balls[0].status).to.equal(0);
    });

    it('Rescue Sequence', function () {
      // First Lock
      wiser.process('r1w1');
      wiser.process('r2w1');
      expect(wiser.w.balls[0].status).to.equal(2);
      expect(wiser.w.balls[0].hitBy).to.have.ordered.members(['r1', 'r2']);

      wiser.process('w3r1');
      expect(wiser.w.balls[0].status).to.equal(1);
      expect(wiser.w.balls[0].hitBy).to.have.ordered.members(['r2']);

      wiser.process('w3r2');
      expect(wiser.w.balls[0].status).to.equal(0);
    });

    it('Transer active hit list of eliminated ball to team pending active hits', function () {
      // First Lock
      wiser.process('r1w1');
      wiser.process('r1w1');
      wiser.process('r1w2');
      wiser.process('r1w3');
      wiser.process('r1w2');
      wiser.process('r1w3');
      expect(wiser.r.balls[0].hits).to.have.ordered.members(['w1', 'w1', 'w2', 'w3', 'w2', 'w3']);

      // R1 get eliminated
      wiser.process('w4r1');
      wiser.process('w4r1');
      wiser.process('w4r1');
      expect(wiser.r.pendingRescue).to.have.ordered.members(['w3', 'w2', 'w3']);

      // Clear the ball active hit list first before the team active hit list
      wiser.process('r5w7');
      expect(wiser.w.balls[6].status).to.equal(1);
      wiser.process('w4r5');
      expect(wiser.w.balls[6].status).to.equal(0);

      // Now only clear pending list
      wiser.process('w4r5');
      expect(wiser.r.pendingRescue).to.have.ordered.members(['w2', 'w3']);

      wiser.process('w4r5');
      expect(wiser.r.pendingRescue).to.have.ordered.members(['w3']);

      // Hit another ball without no active hit list
      wiser.process('w2r7');
      expect(wiser.r.pendingRescue).to.be.an('array').that.is.empty;
    });
  });

  describe('Miss Hit Malaysia Rule', function () {
    let wiser = new Wiser('Red', 'White');

    beforeEach(function () {
    // Clear internal state
      wiser.clear();
    });

    it('Normal Miss Hit', function () {
      wiser.process('r1r2');
      expect(wiser.w.pendingRescue).to.have.ordered.members(['r2m', 'r1m']);

      // Rescue miss hit ball
      wiser.process('r3w1');
      expect(wiser.w.pendingRescue).to.have.ordered.members(['r1m']);
      expect(wiser.r.balls[1].hitBy).to.be.an('array').that.is.empty;

      wiser.process('r3w1');
      expect(wiser.w.pendingRescue).to.be.an('array').that.is.empty;
      expect(wiser.r.balls[0].hitBy).to.be.an('array').that.is.empty;
    });

    it('Miss Hit locked ball', function () {
      wiser.process('w1r2');
      wiser.process('r1r2');

      // Rescue Miss Hit ball first if the target no active hit
      wiser.process('r3w3');
      expect(wiser.r.balls[1].hitBy).to.have.ordered.members(['w1']);
      expect(wiser.w.pendingRescue).to.have.ordered.members(['r1m']);

      // Rescue Miss Hit ball first if the target no active hit
      wiser.process('r3w1');
      expect(wiser.r.balls[1].hitBy).to.be.an('array').that.is.empty;
      expect(wiser.w.pendingRescue).to.have.ordered.members(['r1m']);

      // Rescue another miss hit if the target no active hit
      wiser.process('r3w1');
      expect(wiser.r.balls[1].hitBy).to.be.an('array').that.is.empty;
      expect(wiser.w.pendingRescue).to.be.an('array').that.is.empty;
    });

    it('Double Miss Hit', function () {
      wiser.process('r1r2');
      wiser.process('r3r2');

      // Expect rescue order r2 -> r1 -> r2 -> r3
      expect(wiser.w.pendingRescue).to.have.ordered.members(['r2m', 'r1m', 'r2m', 'r3m']);
      expect(wiser.r.balls[1].status).to.equal(2);

      // Start rescue order
      wiser.process('r4w1');
      expect(wiser.w.pendingRescue).to.have.ordered.members(['r1m', 'r2m', 'r3m']);
      expect(wiser.r.balls[1].hitBy).to.have.ordered.members(['r3']);

      wiser.process('r4w1');
      expect(wiser.w.pendingRescue).to.have.ordered.members(['r2m', 'r3m']);
      expect(wiser.r.balls[1].hitBy).to.have.ordered.members(['r3']);

      wiser.process('r4w1');
      expect(wiser.w.pendingRescue).to.have.ordered.members(['r3m']);
      expect(wiser.r.balls[1].hitBy).to.be.an('array').that.is.empty;

      wiser.process('r4w2');
      expect(wiser.w.pendingRescue).to.be.an('array').that.is.empty;
      expect(wiser.r.balls[1].hitBy).to.be.an('array').that.is.empty;
    });

    it('Miss Hit eliminated the locked ball', function () {
      wiser.process('w1r2');
      wiser.process('w1r2');
      wiser.process('r3r2');

      expect(wiser.w.pendingRescue).to.have.ordered.members(['r3m']);
    });
  });

  describe('Score', function () {
    let wiser = new Wiser('Red', 'White');

    beforeEach(function () {
    // Clear internal state
      wiser.clear();
    });

    it('Test Score', function () {
      wiser.process('w1r2');

      expect(wiser.w.score).to.equal(35);
      expect(wiser.r.score).to.equal(32);

      wiser.process('w1r2');
      expect(wiser.w.score).to.equal(35);
      expect(wiser.r.score).to.equal(31);

      wiser.process('w1r2');
      expect(wiser.w.score).to.equal(35);
      expect(wiser.r.score).to.equal(30);

      wiser.process('w1r3');
      expect(wiser.w.score).to.equal(35);
      expect(wiser.r.score).to.equal(27);

      wiser.process('r1w1');
      expect(wiser.w.score).to.equal(32);
      expect(wiser.r.score).to.equal(30);

      wiser.process('w7r1');
      expect(wiser.w.score).to.equal(35);
      expect(wiser.r.score).to.equal(27);
    });
  });
});
