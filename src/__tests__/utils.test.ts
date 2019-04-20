import { isMissHittSequence, isNormalHitSequence, removeFirst, removeFirstTeamBall } from '../utils';

describe('removeFirst', () => {
  test('Remove first matched value in the array', () => {
    const arr = ['r1', 'r2', 'r1', 'w1', 'w3', 'r4'];

    removeFirst(arr, 'r1');
    expect(arr).toEqual(['r2', 'r1', 'w1', 'w3', 'r4']);

    removeFirst(arr, 'w1');
    expect(arr).toEqual(['r2', 'r1', 'w3', 'r4']);

    removeFirst(arr, 'r4');
    expect(arr).toEqual(['r2', 'r1', 'w3']);
  });

  test('Does not remove if there is no match value', () => {
    const arr = ['r1', 'r2', 'r1', 'w1', 'w3', 'r4'];

    removeFirst(arr, 'r7');
    expect(arr).toEqual(['r1', 'r2', 'r1', 'w1', 'w3', 'r4']);
  });

  test('Empty array', () => {
    const arr = [];
    removeFirst(arr, 'r1');
    expect(arr).toEqual([]);
  });
});

describe('removeFirstTeamBall', () => {
  test('Remove first ball from team', () => {
    const arr = ['r1', 'r2', 'r1', 'w1', 'w3', 'r4'];

    expect(removeFirstTeamBall(arr, 'r')).toBe('r1');
    expect(arr).toEqual(['r2', 'r1', 'w1', 'w3', 'r4']);

    expect(removeFirstTeamBall(arr, 'w')).toBe('w1');
    expect(arr).toEqual(['r2', 'r1', 'w3', 'r4']);

    expect(removeFirstTeamBall(arr, 'w')).toBe('w3');
    expect(arr).toEqual(['r2', 'r1', 'r4']);
  });

  test('Does not remove if there is no match value', () => {
    const arr = ['r1', 'r2', 'r1', 'r4'];

    expect(removeFirstTeamBall(arr, 'w')).toBe(null);
    expect(arr).toEqual(['r1', 'r2', 'r1', 'r4']);
  });

  test('Empty array', () => {
    const arr = [];
    expect(removeFirstTeamBall(arr, 'w')).toBe(null);
    expect(arr).toEqual([]);
  });
});

test('isNormalHitSequence', () => {
  const seq = [
    { action: 'r1r2', nullified: false },
    { action: 'w4r2', nullified: false },
    { action: 'r7w4', nullified: false },
  ];

  expect(seq.filter(s => isNormalHitSequence(s.action, 'r2'))).toEqual([{ action: 'w4r2', nullified: false }]);

  // If not match
  expect(seq.filter(s => isNormalHitSequence(s.action, 'r3'))).toEqual([]);
});

test('isMissHitSequence', () => {
  const seq = [
    { action: 'r1r2', nullified: false },
    { action: 'w4r2', nullified: false },
    { action: 'r7w4', nullified: false },
  ];

  expect(seq.filter(s => isMissHittSequence(s.action, 'r1'))).toEqual([{ action: 'r1r2', nullified: false }]);

  // If not match
  expect(seq.filter(s => isMissHittSequence(s.action, 'r3'))).toEqual([]);

  // WWSC
  expect(seq.filter(s => isMissHittSequence(s.action, 'r2', true))).toEqual([{ action: 'r1r2', nullified: false }]);
});
