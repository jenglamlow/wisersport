import { removeFirst, removeFirstTeamBall } from '../utils';

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

    expect(removeFirstTeamBall(arr, 'r')).toBe(true);
    expect(arr).toEqual(['r2', 'r1', 'w1', 'w3', 'r4']);

    expect(removeFirstTeamBall(arr, 'w')).toBe(true);
    expect(arr).toEqual(['r2', 'r1', 'w3', 'r4']);

    expect(removeFirstTeamBall(arr, 'w')).toBe(true);
    expect(arr).toEqual(['r2', 'r1', 'r4']);
  });

  test('Does not remove if there is no match value', () => {
    const arr = ['r1', 'r2', 'r1', 'r4'];

    expect(removeFirstTeamBall(arr, 'w')).toBe(false);
    expect(arr).toEqual(['r1', 'r2', 'r1', 'r4']);
  });

  test('Empty array', () => {
    const arr = [];
    expect(removeFirstTeamBall(arr, 'w')).toBe(false);
    expect(arr).toEqual([]);
  });
});
