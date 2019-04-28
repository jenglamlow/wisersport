import deepDiff from 'deep-diff';

import { CommandManager } from '../CommandManager';

test('Add', () => {
  const cm = new CommandManager();

  const s0 = {
    state: 0,
    list: [],
  };

  const s1 = {
    state: 1,
    list: ['r1'],
  };

  const command = {
    command: 'r1r2',
    diff: deepDiff.diff(s0, s1),
    undo: () => {
      // console.log(diff);
    },
    redo: () => {
      // console.log('redeo')
    },
  };

  cm.add(command);

  // console.log(cm.stackList());
  cm.undo();
});
