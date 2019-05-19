import { BallStatus } from '../Constant';
import { Wiser } from '../Wiser';

const wiser = new Wiser();

beforeEach(() => {
  wiser.reset();
  wiser.state.info.rules.config.missHitType = 'MY';
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

    // Malaysia
    expect(wiser.state.match.r.balls[0].status).toBe(BallStatus.FirstLocked);
    expect(wiser.state.match.r.balls[0].activeHits).toEqual(['r2']);
    expect(wiser.state.match.r.balls[0].hits).toEqual(['r2']);
    expect(wiser.state.match.r.balls[1].status).toBe(BallStatus.Contesting);
    expect(wiser.state.match.r.balls[1].hitBy).toEqual([]);

    // WWSC
    wiser.state.info.rules.config.missHitType = 'WWSC';

    wiser.process('r3r4');
    expect(wiser.state.match.r.balls[2].status).toBe(BallStatus.Eliminated);
    expect(wiser.state.match.r.balls[3].status).toBe(BallStatus.FirstLocked);
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
    expect(wiser.state.match.r.pendingRescue).toEqual(['w2', 'w3', 'w3']);

    wiser.process('w4r4');
    expect(wiser.state.match.r.pendingRescue).toEqual(['w3', 'w3']);
    expect(wiser.state.match.w.balls[1].status).toBe(BallStatus.Contesting);

    wiser.process('r5w6');
    expect(wiser.state.match.w.balls[5].status).toBe(BallStatus.FirstLocked);

    // Rescue target's active hits first before team active hits
    wiser.process('w4r5');
    expect(wiser.state.match.r.pendingRescue).toEqual(['w3', 'w3']);
    expect(wiser.state.match.w.balls[5].status).toBe(BallStatus.Contesting);

    wiser.process('w4r5');
    expect(wiser.state.match.r.pendingRescue).toEqual(['w3']);
    expect(wiser.state.match.w.balls[2].status).toBe(BallStatus.FirstLocked);

    wiser.process('w4r5');
    expect(wiser.state.match.r.pendingRescue).toEqual([]);
    expect(wiser.state.match.w.balls[2].status).toBe(BallStatus.Contesting);
  });

  test('Basic Rescue Miss Hit', () => {
    wiser.process('r1r2');

    // Malaysia
    expect(wiser.state.match.r.balls[0].status).toBe(BallStatus.FirstLocked);
    expect(wiser.state.match.r.balls[0].activeHits).toEqual(['r2']);
    expect(wiser.state.match.r.balls[1].status).toBe(BallStatus.Contesting);
    expect(wiser.state.match.r.balls[1].hitBy).toEqual([]);
    expect(wiser.state.match.r.pendingRescue).toEqual(['r1']);

    wiser.process('r3w1');
    expect(wiser.state.match.r.balls[0].status).toBe(BallStatus.Contesting);
    expect(wiser.state.match.r.balls[0].activeHits).toEqual([]);
    expect(wiser.state.match.r.balls[1].hitBy).toEqual([]);
    expect(wiser.state.match.r.pendingRescue).toEqual([]);

    // WWSC
    wiser.state.info.rules.config.missHitType = 'WWSC';

    wiser.process('r1r2');
    expect(wiser.state.match.r.balls[0].status).toBe(BallStatus.Eliminated);
    expect(wiser.state.match.r.balls[0].activeHits).toEqual([]);
    expect(wiser.state.match.r.balls[1].status).toBe(BallStatus.FirstLocked);
    expect(wiser.state.match.r.balls[1].hitBy).toEqual(['r1']);
    expect(wiser.state.match.r.pendingRescue).toEqual(['r2']);

    wiser.process('r3w1');
    expect(wiser.state.match.r.balls[0].status).toBe(BallStatus.Eliminated);
    expect(wiser.state.match.r.balls[1].status).toBe(BallStatus.Contesting);
    expect(wiser.state.match.r.balls[1].hitBy).toEqual([]);
    expect(wiser.state.match.r.pendingRescue).toEqual([]);
  });

  test('MY Miss Hit and Get Locked By Opponent Combination Rescue Order Case 1', () => {
    wiser.process('r1r2');
    expect(wiser.state.match.r.balls[0].status).toBe(BallStatus.FirstLocked);
    expect(wiser.state.match.r.balls[0].activeHits).toEqual(['r2']);
    expect(wiser.state.match.r.balls[1].status).toBe(BallStatus.Contesting);
    expect(wiser.state.match.r.balls[1].hitBy).toEqual([]);
    expect(wiser.state.match.r.pendingRescue).toEqual(['r1']);

    wiser.process('w1r1');
    expect(wiser.state.match.r.balls[0].status).toBe(BallStatus.SecondLocked);
    expect(wiser.state.match.r.balls[0].hitBy).toEqual(['w1']);
    expect(wiser.state.match.r.pendingRescue).toEqual(['r1']);

    wiser.process('r3w2');
    expect(wiser.state.match.r.balls[0].status).toBe(BallStatus.FirstLocked);
    expect(wiser.state.match.r.balls[0].hitBy).toEqual(['w1']);
    expect(wiser.state.match.r.pendingRescue).toEqual([]);

    wiser.process('r3w1');
    expect(wiser.state.match.r.balls[0].status).toBe(BallStatus.Contesting);
    expect(wiser.state.match.r.balls[0].hitBy).toEqual([]);
    expect(wiser.state.match.r.pendingRescue).toEqual([]);
  });

  test('MY Miss Hit and Get Locked By Opponent Combination Rescue Order Case 2', () => {
    wiser.process('r1r2');
    expect(wiser.state.match.r.balls[0].status).toBe(BallStatus.FirstLocked);
    expect(wiser.state.match.r.balls[0].activeHits).toEqual(['r2']);
    expect(wiser.state.match.r.balls[1].status).toBe(BallStatus.Contesting);
    expect(wiser.state.match.r.balls[1].hitBy).toEqual([]);
    expect(wiser.state.match.r.pendingRescue).toEqual(['r1']);

    wiser.process('w1r1');
    expect(wiser.state.match.r.balls[0].status).toBe(BallStatus.SecondLocked);
    expect(wiser.state.match.r.balls[0].hitBy).toEqual(['w1']);
    expect(wiser.state.match.r.pendingRescue).toEqual(['r1']);

    wiser.process('r3w1');
    expect(wiser.state.match.r.balls[0].status).toBe(BallStatus.FirstLocked);
    expect(wiser.state.match.r.balls[0].hitBy).toEqual([]);
    expect(wiser.state.match.r.pendingRescue).toEqual(['r1']);

    wiser.process('r3w2');
    expect(wiser.state.match.r.balls[0].status).toBe(BallStatus.Contesting);
    expect(wiser.state.match.r.balls[0].hitBy).toEqual([]);
    expect(wiser.state.match.r.pendingRescue).toEqual([]);
  });

  test('WWSC Miss Hit and Get Locked By Opponent Combination Rescue Order Case 1', () => {
    // WWSC
    wiser.state.info.rules.config.missHitType = 'WWSC';

    wiser.process('r1r2');
    expect(wiser.state.match.r.balls[0].status).toBe(BallStatus.Eliminated);
    expect(wiser.state.match.r.balls[1].status).toBe(BallStatus.FirstLocked);
    expect(wiser.state.match.r.balls[1].hitBy).toEqual(['r1']);
    expect(wiser.state.match.r.pendingRescue).toEqual(['r2']);

    wiser.process('w1r2');
    expect(wiser.state.match.r.balls[1].status).toBe(BallStatus.SecondLocked);
    expect(wiser.state.match.r.balls[1].hitBy).toEqual(['r1', 'w1']);
    expect(wiser.state.match.r.pendingRescue).toEqual(['r2']);

    wiser.process('r7w3');
    expect(wiser.state.match.r.balls[1].status).toBe(BallStatus.FirstLocked);
    expect(wiser.state.match.r.balls[1].hitBy).toEqual(['w1']);
    expect(wiser.state.match.r.pendingRescue).toEqual([]);

    wiser.process('r7w1');
    expect(wiser.state.match.r.balls[1].status).toBe(BallStatus.Contesting);
    expect(wiser.state.match.r.balls[1].hitBy).toEqual([]);
    expect(wiser.state.match.r.pendingRescue).toEqual([]);
  });

  test('WWSC Miss Hit and Get Locked By Opponent Combination Rescue Order Case 2', () => {
    // WWSC
    wiser.state.info.rules.config.missHitType = 'WWSC';

    wiser.process('r1r2');
    expect(wiser.state.match.r.balls[0].status).toBe(BallStatus.Eliminated);
    expect(wiser.state.match.r.balls[1].status).toBe(BallStatus.FirstLocked);
    expect(wiser.state.match.r.balls[1].hitBy).toEqual(['r1']);
    expect(wiser.state.match.r.pendingRescue).toEqual(['r2']);

    wiser.process('w1r2');
    expect(wiser.state.match.r.balls[1].status).toBe(BallStatus.SecondLocked);
    expect(wiser.state.match.r.balls[1].hitBy).toEqual(['r1', 'w1']);
    expect(wiser.state.match.r.pendingRescue).toEqual(['r2']);

    wiser.process('r7w1');
    expect(wiser.state.match.r.balls[1].status).toBe(BallStatus.FirstLocked);
    expect(wiser.state.match.r.balls[1].hitBy).toEqual(['r1']);
    expect(wiser.state.match.r.pendingRescue).toEqual(['r2']);

    wiser.process('r7w3');
    expect(wiser.state.match.r.balls[1].status).toBe(BallStatus.Contesting);
    expect(wiser.state.match.r.balls[1].hitBy).toEqual([]);
    expect(wiser.state.match.r.pendingRescue).toEqual([]);
  });
});

describe('Sequence', () => {
  test('Record Sequence', () => {
    wiser.process('r1w2');
    expect(wiser.state.match.sequences).toEqual([{ action: 'r1w2', nullified: false }]);

    wiser.process('w1r3');
    expect(wiser.state.match.sequences).toEqual([
      { action: 'r1w2', nullified: false },
      { action: 'w1r3', nullified: false },
    ]);
  });

  test('Nullify Eliminated Ball Sequences', () => {
    wiser.process('r1w2');
    wiser.process('r1w2');
    wiser.process('r1w2');
    expect(wiser.state.match.sequences).toEqual([
      { action: 'r1w2', nullified: true },
      { action: 'r1w2', nullified: true },
      { action: 'r1w2', nullified: true },
    ]);
  });

  test('Nullify Rescue Ball Sequences', () => {
    wiser.process('r1w2');
    wiser.process('w3r1');
    expect(wiser.state.match.sequences).toEqual([
      { action: 'r1w2', nullified: true },
      { action: 'w3r1', nullified: false },
    ]);
    wiser.process('r4w3');
    expect(wiser.state.match.sequences).toEqual([
      { action: 'r1w2', nullified: true },
      { action: 'w3r1', nullified: true },
      { action: 'r4w3', nullified: false },
    ]);
  });

  test('MY Nullify Miss Hit Sequences', () => {
    wiser.process('r1r2');
    expect(wiser.state.match.sequences).toEqual([{ action: 'r1r2', nullified: false }]);
    wiser.process('r3w4');
    expect(wiser.state.match.sequences).toEqual([
      { action: 'r1r2', nullified: true },
      { action: 'r3w4', nullified: false },
    ]);
  });

  test('WWSC Nullify Miss Hit Sequences', () => {
    wiser.state.info.rules.config.missHitType = 'WWSC';

    wiser.process('r1r2');
    expect(wiser.state.match.sequences).toEqual([{ action: 'r1r2', nullified: false }]);
    wiser.process('r3w4');
    expect(wiser.state.match.sequences).toEqual([
      { action: 'r1r2', nullified: true },
      { action: 'r3w4', nullified: false },
    ]);
  });

  test('WWSC Nullify Team Pending Rescue', () => {
    wiser.process('r1w1');
    wiser.process('r1w2');
    wiser.process('r1w1');
    wiser.process('r1w2');
    wiser.process('r1w3');
    wiser.process('r1w3');
    wiser.process('w4r1');
    wiser.process('w4r1');
    wiser.process('w4r1');
    expect(wiser.state.match.sequences).toEqual([
      { action: 'r1w1', nullified: true },
      { action: 'r1w2', nullified: true },
      { action: 'r1w1', nullified: true },
      { action: 'r1w2', nullified: false },
      { action: 'r1w3', nullified: false },
      { action: 'r1w3', nullified: false },
      { action: 'w4r1', nullified: true },
      { action: 'w4r1', nullified: true },
      { action: 'w4r1', nullified: true },
    ]);

    wiser.process('w4r7');
    expect(wiser.state.match.sequences).toEqual([
      { action: 'r1w1', nullified: true },
      { action: 'r1w2', nullified: true },
      { action: 'r1w1', nullified: true },
      { action: 'r1w2', nullified: true },
      { action: 'r1w3', nullified: false },
      { action: 'r1w3', nullified: false },
      { action: 'w4r1', nullified: true },
      { action: 'w4r1', nullified: true },
      { action: 'w4r1', nullified: true },
      { action: 'w4r7', nullified: false },
    ]);

    wiser.process('w4r7');
    expect(wiser.state.match.sequences).toEqual([
      { action: 'r1w1', nullified: true },
      { action: 'r1w2', nullified: true },
      { action: 'r1w1', nullified: true },
      { action: 'r1w2', nullified: true },
      { action: 'r1w3', nullified: true },
      { action: 'r1w3', nullified: false },
      { action: 'w4r1', nullified: true },
      { action: 'w4r1', nullified: true },
      { action: 'w4r1', nullified: true },
      { action: 'w4r7', nullified: false },
      { action: 'w4r7', nullified: false },
    ]);

    wiser.process('w4r7');
    expect(wiser.state.match.sequences).toEqual([
      { action: 'r1w1', nullified: true },
      { action: 'r1w2', nullified: true },
      { action: 'r1w1', nullified: true },
      { action: 'r1w2', nullified: true },
      { action: 'r1w3', nullified: true },
      { action: 'r1w3', nullified: true },
      { action: 'w4r1', nullified: true },
      { action: 'w4r1', nullified: true },
      { action: 'w4r1', nullified: true },
      { action: 'w4r7', nullified: true },
      { action: 'w4r7', nullified: true },
      { action: 'w4r7', nullified: true },
    ]);
  });

  test('MY Nullify Miss Hit Sequences (Complex)', () => {
    wiser.process('r1r2');
    expect(wiser.state.match.sequences).toEqual([{ action: 'r1r2', nullified: false }]);
    wiser.process('w4r1');
    expect(wiser.state.match.sequences).toEqual([
      { action: 'r1r2', nullified: false },
      { action: 'w4r1', nullified: false },
    ]);
    wiser.process('r7w4');
    expect(wiser.state.match.sequences).toEqual([
      { action: 'r1r2', nullified: false },
      { action: 'w4r1', nullified: true },
      { action: 'r7w4', nullified: false },
    ]);

    wiser.process('r7w5');
    expect(wiser.state.match.sequences).toEqual([
      { action: 'r1r2', nullified: true },
      { action: 'w4r1', nullified: true },
      { action: 'r7w4', nullified: false },
      { action: 'r7w5', nullified: false },
    ]);
  });

  test('WWSC Nullify Miss Hit Sequences (Complex)', () => {
    wiser.state.info.rules.config.missHitType = 'WWSC';

    wiser.process('r1r2');
    expect(wiser.state.match.sequences).toEqual([{ action: 'r1r2', nullified: false }]);
    wiser.process('w4r2');
    expect(wiser.state.match.sequences).toEqual([
      { action: 'r1r2', nullified: false },
      { action: 'w4r2', nullified: false },
    ]);
    wiser.process('r7w4');
    expect(wiser.state.match.sequences).toEqual([
      { action: 'r1r2', nullified: false },
      { action: 'w4r2', nullified: true },
      { action: 'r7w4', nullified: false },
    ]);

    wiser.process('r7w5');
    expect(wiser.state.match.sequences).toEqual([
      { action: 'r1r2', nullified: true },
      { action: 'w4r2', nullified: true },
      { action: 'r7w4', nullified: false },
      { action: 'r7w5', nullified: false },
    ]);
  });

  test('WWSC Nullify Miss Hit Sequences (Complex Eliminated)', () => {
    wiser.state.info.rules.config.missHitType = 'WWSC';

    wiser.process('r1r2');
    expect(wiser.state.match.sequences).toEqual([{ action: 'r1r2', nullified: false }]);
    wiser.process('w4r2');
    expect(wiser.state.match.sequences).toEqual([
      { action: 'r1r2', nullified: false },
      { action: 'w4r2', nullified: false },
    ]);
    wiser.process('r3r2');
    expect(wiser.state.match.sequences).toEqual([
      { action: 'r1r2', nullified: true },
      { action: 'w4r2', nullified: true },
      { action: 'r3r2', nullified: true },
    ]);
  });
});

describe('Score Info', () => {
  test('Compute Score', () => {
    wiser.process('r1w3');

    expect(wiser.state.match.r.score.point).toBe(35);
    expect(wiser.state.match.w.score.contesting).toBe(6);
    expect(wiser.state.match.w.score.firstLocked).toBe(1);
    expect(wiser.state.match.w.score.point).toBe(32);

    wiser.process('w2r1');
    expect(wiser.state.match.w.score.point).toBe(35);
    expect(wiser.state.match.r.score.contesting).toBe(6);
    expect(wiser.state.match.r.score.firstLocked).toBe(1);
    expect(wiser.state.match.r.score.point).toBe(32);
  });

  test('Winner', () => {
    wiser.process('r1w1');
    wiser.process('r1w2');
    wiser.process('r1w3');
    wiser.process('r1w4');
    wiser.process('r1w5');
    wiser.process('r1w6');
    expect(wiser.state.match.winner).toBe('');
    wiser.process('r1w7');
    expect(wiser.state.match.winner).toBe('r');
    expect(wiser.state.match.w.score.contesting).toBe(0);

    // Throw error if the match already has winner
    expect(() => {
      wiser.process('r1w7');
    }).toThrow('The match already ended');
  });
});

describe('Undo/Redo', () => {
  test('Basic Undo/Redo', () => {
    const s0 = JSON.parse(JSON.stringify(wiser.state.match));
    wiser.process('r1w2');
    const s1 = JSON.parse(JSON.stringify(wiser.state.match));
    wiser.process('r3w4');
    const s2 = JSON.parse(JSON.stringify(wiser.state.match));

    wiser.undo();
    expect(wiser.state.match).toEqual(s1);

    wiser.undo();
    expect(wiser.state.match).toEqual(s0);

    wiser.redo();
    expect(wiser.state.match).toEqual(s1);

    wiser.redo();
    expect(wiser.state.match).toEqual(s2);
  });

  test('Undo and Replace', () => {
    wiser.process('r1w2');
    wiser.process('r1w2');
    wiser.undo();
    wiser.process('r1w3');

    // Should replace the undo command
    expect(wiser.state.match.sequences).toEqual([
      { action: 'r1w2', nullified: false },
      { action: 'r1w3', nullified: false },
    ]);
  });
});
