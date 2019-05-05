import deepDiff from 'deep-diff';

import { CommandManager } from '../CommandManager';

test('Basic Add, Undo, Redo', () => {
  const s = {
    state: 0,
    list: [] as string[],
  };

  const cm = new CommandManager(s);

  const prev = JSON.parse(JSON.stringify(s));

  s.state = 1;
  s.list.push('r1');

  const curr = JSON.parse(JSON.stringify(s));

  const command = {
    command: 'r1r2',
    diff: deepDiff.diff(prev, s),
    undo: (state, diff) => {
      for (const i of diff) {
        deepDiff.revertChange(state, {}, i);
      }
    },
    redo: (state, diff) => {
      for (const i of diff) {
        deepDiff.applyChange(state, {}, i);
      }
    },
  };

  cm.add(command);

  expect(cm.stackList().length).toBe(1);
  expect(cm.stack(0)).toEqual(command);
  // Index number exceed test
  expect(cm.stack(2)).toEqual(null);

  cm.undo();
  expect(s).toEqual(prev);

  // If undo stack is empty, should remain the same state
  cm.undo();
  expect(s).toEqual(prev);

  cm.redo();
  expect(s).toEqual(curr);

  // If redo stack is empty, should remain the same state
  cm.redo();
  expect(s).toEqual(curr);
});
