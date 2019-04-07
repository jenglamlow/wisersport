import deepDiff from 'deep-diff';

import { CommandManager, ICommand, ICommandManager } from './CommandManager';
import { BallStatus } from './Constant';

interface ISequence {
  action: string;
  nullified: boolean;
}

interface IBallstate {
  label: string;
  status: BallStatus;
  foul: number;
  hits: string[];
  activeHits: string[];
  hitBy: string[];
}

interface ITeamState {
  name: string;
  score: number;
  balls: IBallstate[];
}

type TeamKeys = 'r' | 'w';
interface IMatchInfo {
  winner: string;
  r: ITeamState;
  w: ITeamState;
  sequences: ISequence[];
}

interface IGameTeamInfo {
  name: string;
}

interface IGameInfo {
  rules: object;
  r: IGameTeamInfo;
  w: IGameTeamInfo;
}

interface IBall {
  team: TeamKeys;
  idx: number;
}

export interface IGameState {
  info: IGameInfo;
  match: IMatchInfo;
}

const gameState: IGameState = {
  info: {
    rules: {},
    r: {
      name: '',
    },
    w: {
      name: '',
    },
  },
  match: {
    winner: '',
    r: {
      name: '',
      score: 0,
      balls: [],
    },
    w: {
      name: '',
      score: 0,
      balls: [],
    },
    sequences: [],
  },
};

export class Wiser {
  public state: IGameState;
  public manager: ICommandManager;

  constructor(red: string = 'Red Team', white: string = 'White Team', numOfBalls: number = 7) {
    this.manager = new CommandManager();

    // Initialize Game State
    this.state = gameState;
    this.state.info.r.name = red;
    this.state.info.w.name = white;

    this.initBallState(numOfBalls);
  }

  public process(input: string) {
    const re = /([rw])([1-7])([frw])([mx1-7])/g;
    const match = re.exec(input);

    // Validate Input
    if (!match) {
      throw new Error(`${input} is an invalid input`);
    }

    // Check winner
    if (this.state.match.winner) {
      throw new Error('The match already ended');
    }

    try {
      const s: IBall = {
        team: match[1] === 'r' ? 'r' : 'w',
        idx: parseInt(match[2], 10) - 1,
      };

      const t: IBall = {
        team: match[3] === 'r' ? 'r' : 'w',
        idx: parseInt(match[4], 10) - 1,
      };

      const prevMatchState = JSON.parse(JSON.stringify(this.state.match));

      // Proper Hit
      if (s.team !== t.team) {
        const rescue = this.hit(s,t);
      }
    } catch {}

    // Generate command based on input
    // const command: ICommand = {
    //   command: 'r1w1',
    //   undo: (state) => {console.log(state);},
    //   redo: (state) => {console.log(state);}
    // };

    // Update state based on current input
    // this.hit('r1','w1');

    // Add to CommandManager
    // this.manager.add(command);
  }

  public reset () {
    this.state.match.sequences = [];
    this.initBallState(this.state.match.r.balls.length);
  }

  private initBallState(numOfBalls: number) {
    this.state.match.r.balls = Array(numOfBalls)
      .fill(0)
      .map((_, i) => ({
        label: `r${i + 1}`,
        status: BallStatus.Contesting,
        foul: 0,
        hits: [],
        activeHits: [],
        hitBy: [],
      }));
    this.state.match.w.balls = Array(numOfBalls)
      .fill(0)
      .map((_, i) => ({
        label: `w${i + 1}`,
        status: BallStatus.Contesting,
        foul: 0,
        hits: [],
        activeHits: [],
        hitBy: [],
      }));
  }

  private hit(src: IBall, target: IBall) {
    const s = this.state.match[src.team].balls[src.idx];
    const t = this.state.match[target.team].balls[target.idx];

    // Source
    // Check whether source can hit
    if (s.status === BallStatus.Contesting) {
      s.hits.push(t.label);
      s.activeHits.push(t.label);
    } else {
      throw new Error(`${s.label} is not contesting ball. Cannot hit!`);
    }

    // Target
    let rescue = null;
    if (t.status !== BallStatus.Eliminated) {
      t.hitBy.push(s.label);
      t.status += 1;

      // Check whether target is eliminated
      if (t.status === BallStatus.Eliminated) {
        // Remove target from source's active list
        s.activeHits = s.activeHits.filter(ball => ball !== t.label);

        // Remove pending rescue from the eliminated ball
        // this[s.team].removePendingRescueTarget(t.label);
        // this[s.team].removePendingRescueTarget(t.label + 'm');

        // Nullify eliminated sequence
        // this.nullify('eliminate', t.label);
      }

      // Get rescue ball if exist
      if (t.activeHits.length > 0) {
        rescue = t.activeHits.shift();
      }
    } else {
      throw new Error(`${t.label} is already eliminated!`);
    }
    
    return rescue;
  }
}

const wiser = new Wiser();

wiser.process('r1w2');

// const cm = new CommandManager();

// const command: ICommand = {
//   command: 'r1w1',
//   undo: (state) => console.log('undo'),
//   redo: (state) => console.log('redo')
// };

// cm.add({
//   command: 'r1w1',
//   undo: (state) => console.log('undo r1w1'),
//   redo: (state) => console.log('redo r1w1')
// });
// cm.add({
//   command: 'r2w2',
//   undo: (state) => console.log('undo r2w2'),
//   redo: (state) => console.log('redo r2w2')
// });
// cm.add({
//   command: 'r3w3',
//   undo: (state) => console.log('undo r3w3'),
//   redo: (state) => console.log('redo r3w3')
// });

// console.log(cm.stackList());

// const s0 = {
//   match: {
//     r: {
//       name: '',
//       score: 0,
//       balls: [],
//     },
//     w: {
//       name: '',
//       score: 0,
//       balls: [],
//     },
//     sequences: [],
//   }
// };

// const s1 = {
//   match: {
//     r: {
//       name: '',
//       score: 1,
//       balls: [],
//     },
//     w: {
//       name: '',
//       score: 1,
//       balls: [],
//     },
//     sequences: [{
//       action: "r1w1",
//       nullified: false
//     }],
//   }
// };

// const change = deepDiff.diff(s0,s1);
// let t;
// // deepDiff.applyDiff(t,s0, change);
// if (change) {
//   for (const i of change) {
//     deepDiff.applyChange(s0, {}, i);
//     deepDiff.revertChange(s1, {}, i);

//   }
// }

// console.log(s0);
// console.log(s1);
