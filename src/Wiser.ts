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
  pendingRescue: string[];
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

const template = {
  name: 'Malaysia',
  config: {
    point: {
      contesting: 5,
      firstLocked: 2,
      secondLocked: 1,
      eliminated: 0,
    },
    missHit: {
      sourcePenalty: 1, // 3 - WWSC rule
      targetPenalty: 0, // 1 - WWSC rule
    },
  },
};

const gameState: IGameState = {
  info: {
    rules: { ...template },
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
      pendingRescue: [],
      balls: [],
    },
    w: {
      name: '',
      score: 0,
      pendingRescue: [],
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

    const s = this.convertBall(`${match[1]}${match[2]}`);
    const t = this.convertBall(`${match[3]}${match[4]}`);

    const prevMatchState = JSON.parse(JSON.stringify(this.state.match));

    // Add into sequence
    this.state.match.sequences.push({
      action: input,
      nullified: false,
    });

    // Proper Hit
    const rescue = this.hit(s, t);
    // this.rescue(rescue)

    // console.log(deepDiff.diff(prevMatchState, this.state.match));
  }

  public reset() {
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

  private convertBall(s: string): IBall {
    return {
      team: s[0] === 'r' ? 'r' : 'w',
      idx: parseInt(s[1], 10) - 1,
    };
  }

  private rescue(target: IBall) {
    // console.log(target);
  }

  private hit(src: IBall, target: IBall) {
    const sTeam = this.state.match[src.team];
    const s = sTeam.balls[src.idx];
    const tTeam = this.state.match[target.team];
    const t = tTeam.balls[target.idx];

    // Input Validation
    // Source must be contesting ball
    if (s.status !== BallStatus.Contesting) {
      throw new Error(`${s.label} is not contesting ball. Cannot hit!`);
    }

    // Target must not eliminated
    if (t.status === BallStatus.Eliminated) {
      throw new Error(`${t.label} is already eliminated!`);
    }

    // Cannot hit ownself
    if (s.label === t.label) {
      throw new Error('Cannot hit ownself!');
    }

    // Check whether is proper hit or miss hit
    if (src.team !== target.team) {
      // Source
      s.hits.push(t.label);
      s.activeHits.push(t.label);

      // Target
      let rescue = null;
      t.hitBy.push(s.label);
      t.status += 1;

      // Check whether target is eliminated
      if (t.status === BallStatus.Eliminated) {
        // Remove target from source's active list
        s.activeHits = s.activeHits.filter(ball => ball !== t.label);

        // Remove the eliminated ball from pending rescue list
        sTeam.pendingRescue = sTeam.pendingRescue.filter(ball => ball !== t.label);

        // Nullify eliminated sequence
        // this.nullify('eliminate', t.label);
      }

      // Get rescue ball if exist
      if (t.activeHits.length > 0) {
        rescue = this.convertBall(t.activeHits.shift() as string);

        // Check if target has any active hits, if so transfer to source pending rescue
        if (t.status === BallStatus.Eliminated) {
          sTeam.pendingRescue.push(...t.activeHits);
        }
      } else {
        // Check pending rescue list
        if (sTeam.pendingRescue.length > 0) {
          rescue = this.convertBall(sTeam.pendingRescue.shift() as string);
        }
      }
      return rescue;
    }
    // Miss Hit
    // console.log('Miss Hit');
  }
}

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
