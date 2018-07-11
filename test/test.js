
'use strict';

const expect = require('chai').expect;
const Wiser = require('../src');

describe('Processing input', function () {
  let wiser = new Wiser('Red', 'White');

  beforeEach(function () {
    // Clear internal state
    wiser.clear();
  });

  it('input length', function () {
    const errorMsg = 'Input length must in the range of 3-4';
    const badInput = ['', 'r', 'r1', 'r1r2x'];

    for (const s of badInput) {
      expect(function () {
        wiser.process(s).to.throw(errorMsg);
      });
    }
  });
});
