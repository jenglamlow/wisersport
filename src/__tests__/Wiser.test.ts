import { BallStatus } from '../Constant';
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
    expect(wiser.state.match.w.balls[0].hitBy).toEqual(['r1']);
    expect(wiser.state.match.w.balls[0].status).toBe(BallStatus.FirstLocked);

    wiser.process('r1w2');
    expect(wiser.state.match.r.balls[0].hits).toEqual(['w1', 'w2']);
    expect(wiser.state.match.r.balls[0].activeHits).toEqual(['w1', 'w2']);

    wiser.process('r1w1');
    expect(wiser.state.match.r.balls[0].hits).toEqual(['w1', 'w2', 'w1']);
    expect(wiser.state.match.r.balls[0].activeHits).toEqual(['w1', 'w2', 'w1']);
    expect(wiser.state.match.w.balls[0].hitBy).toEqual(['r1', 'r1']);
    expect(wiser.state.match.w.balls[0].status).toBe(BallStatus.SecondLocked);

    wiser.process('r1w1');
    expect(wiser.state.match.r.balls[0].hits).toEqual(['w1', 'w2', 'w1', 'w1']);
    expect(wiser.state.match.r.balls[0].activeHits).toEqual(['w2']);
    expect(wiser.state.match.w.balls[0].hitBy).toEqual(['r1', 'r1', 'r1']);
    expect(wiser.state.match.w.balls[0].status).toBe(BallStatus.Eliminated);

    // Hit eliminated target should expect error to be thrown
    expect(() => {
      wiser.process('r1w1');
    }).toThrow('w1 is already eliminated!');
  });

  test('Miss hit', () => {
    wiser.process('r1r2');

    // Malaysia Rule
    expect(wiser.state.match.r.balls[0].status).toBe(BallStatus.FirstLocked);
    expect(wiser.state.match.r.balls[1].status).toBe(BallStatus.Contesting);

    // WWSC Rule
    wiser.state.info.rules.config.missHit.sourcePenalty = 3;
    wiser.state.info.rules.config.missHit.targetPenalty = 1;

    wiser.process('r3r4');
    expect(wiser.state.match.r.balls[2].status).toBe(BallStatus.Eliminated);
    expect(wiser.state.match.r.balls[3].status).toBe(BallStatus.FirstLocked);

    // Reset back to Malaysia Rule
    wiser.state.info.rules.config.missHit.sourcePenalty = 1;
    wiser.state.info.rules.config.missHit.targetPenalty = 0;
  });
});

describe('Rescue', () => {
  test('normal rescue', () => {
    wiser.process('r1w1');
    wiser.process('r1w2');
    wiser.process('r1w1');

    expect(wiser.state.match.w.balls[0].status).toBe(BallStatus.SecondLocked);
    expect(wiser.state.match.w.balls[0].hitBy).toEqual(['r1', 'r1']);

    wiser.process('w3r1');
    expect(wiser.state.match.w.balls[0].status).toBe(BallStatus.FirstLocked);
    expect(wiser.state.match.w.balls[0].hitBy).toEqual(['r1']);
    expect(wiser.state.match.r.balls[0].activeHits).toEqual(['w2', 'w1']);

    wiser.process('w3r1');
    expect(wiser.state.match.w.balls[1].status).toBe(BallStatus.Contesting);
    expect(wiser.state.match.w.balls[0].status).toBe(BallStatus.FirstLocked);
    expect(wiser.state.match.r.balls[0].activeHits).toEqual(['w1']);

    wiser.process('w3r1');
    expect(wiser.state.match.w.balls[1].status).toBe(BallStatus.Contesting);
    expect(wiser.state.match.w.balls[0].status).toBe(BallStatus.Contesting);
    expect(wiser.state.match.r.balls[0].activeHits).toEqual([]);
    expect(wiser.state.match.w.balls[0].hitBy).toEqual([]);
  });

  test('Rescue the balls that is locked by eliminated ball', () => {
    wiser.process('r1w1');
    wiser.process('r1w2');
    wiser.process('r1w1');
    wiser.process('r1w2');
    wiser.process('r1w3');
    wiser.process('r1w3');

    expect(wiser.state.match.r.balls[0].activeHits).toEqual(['w1', 'w2', 'w1', 'w2', 'w3', 'w3']);

    wiser.process('w4r1');
    expect(wiser.state.match.r.balls[0].activeHits).toEqual(['w2', 'w1', 'w2', 'w3', 'w3']);

    wiser.process('w4r1');
    expect(wiser.state.match.r.balls[0].activeHits).toEqual(['w1', 'w2', 'w3', 'w3']);

    // R1 eliminated, R1's active list is transfer to team's active hit
    wiser.process('w4r1');
    expect(wiser.state.match.r.balls[0].activeHits).toEqual([]);
    expect(wiser.state.match.r.balls[0].status).toBe(BallStatus.Eliminated);
    expect(wiser.state.match.r.activeHits).toEqual(['w2', 'w3', 'w3']);

    wiser.process('w4r4');
    expect(wiser.state.match.r.activeHits).toEqual(['w3', 'w3']);
    expect(wiser.state.match.w.balls[1].status).toBe(BallStatus.Contesting);

    wiser.process('r5w6');
    expect(wiser.state.match.w.balls[5].status).toBe(BallStatus.FirstLocked);

    // Rescue target's active hits first before team active hits
    wiser.process('w4r5');
    expect(wiser.state.match.r.activeHits).toEqual(['w3', 'w3']);
    expect(wiser.state.match.w.balls[5].status).toBe(BallStatus.Contesting);

    wiser.process('w4r5');
    expect(wiser.state.match.r.activeHits).toEqual(['w3']);
    expect(wiser.state.match.w.balls[2].status).toBe(BallStatus.FirstLocked);

    wiser.process('w4r5');
    expect(wiser.state.match.r.activeHits).toEqual([]);
    expect(wiser.state.match.w.balls[2].status).toBe(BallStatus.Contesting);
  });
});
