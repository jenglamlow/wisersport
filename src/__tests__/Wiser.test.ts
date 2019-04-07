import { Wiser } from '../Wiser';

const wiser = new Wiser();

beforeEach(() => {
  wiser.reset();
});

describe('Process Command', () => {
  test('command input validataion', () => {
    expect(() => {
      wiser.process('r8w8');
    }).toThrow('r8w8 is an invalid input');
  });
});

describe('Hit', () => {
  test('Hit precondition', () => {
    // First-Locked
    wiser.process('r1w1');
    expect(() => {
      wiser.process('w1r2');
    }).toThrow('w1 is not contesting ball. Cannot hit!');

    // Second-Locked
    wiser.process('r1w1');
    expect(() => {
      wiser.process('w1r2');
    }).toThrow('w1 is not contesting ball. Cannot hit!');

    // Eliminated
    wiser.process('r1w1');
    expect(() => {
      wiser.process('w1r2');
    }).toThrow('w1 is not contesting ball. Cannot hit!');

    // Cannot hit ownself
    expect(() => {
      wiser.process('w7w7');
    }).toThrow('Cannot hit ownself!');
  });

  test('normal hit', () => {
    wiser.process('r1w1');
    expect(wiser.state.match.r.balls[0].hits).toEqual(['w1']);
    expect(wiser.state.match.r.balls[0].activeHits).toEqual(['w1']);

    wiser.process('r1w2');
    expect(wiser.state.match.r.balls[0].hits).toEqual(['w1', 'w2']);
    expect(wiser.state.match.r.balls[0].activeHits).toEqual(['w1', 'w2']);

    wiser.process('r1w1');
    expect(wiser.state.match.r.balls[0].hits).toEqual(['w1', 'w2', 'w1']);
    expect(wiser.state.match.r.balls[0].activeHits).toEqual(['w1', 'w2', 'w1']);

    wiser.process('r1w1');
    expect(wiser.state.match.r.balls[0].hits).toEqual(['w1', 'w2', 'w1', 'w1']);
    expect(wiser.state.match.r.balls[0].activeHits).toEqual(['w2']);

    // Hit eliminated target should expect error to be thrown
    expect(() => {
      wiser.process('r1w1');
    }).toThrow('w1 is already eliminated!');
  });
});

describe('Rescue', () => {
  test('normal rescue', () => {
    wiser.process('r1w1');
    wiser.process('r1w2');
    wiser.process('r1w1');

    wiser.process('w3r1');
  });
});
