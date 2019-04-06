import {Wiser} from '../Wiser';

const wiser = new Wiser();

describe('Process Command', () => {
  test('command input validataion', () => {
    expect(() => {
      wiser.process('r8w8');
    }).toThrow('r8w8 is an invalid input');
  });

  
});
