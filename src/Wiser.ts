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
  activeHits: string[];
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

type MissHitPenaly = 0 | 1 | 2 | 3;
interface IGameRules {
  name: string;
  config: {
    points: {
      contesting: number;
      firstLocked: number;
      secondLocked: number;
      eliminated: number;
    };
    missHit: {
      sourcePenalty: MissHitPenaly;
      targetPenalty: MissHitPenaly;
    };
  };
}

interface IGameInfo {
  rules: IGameRules;
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

const template: IGameRules = {
  name: 'Malaysia',
  config: {
    points: {
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
      activeHits: [],
      balls: [],
    },
    w: {
      name: '',
      score: 0,
      activeHits: [],
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
    if (rescue) {
      this.rescue(rescue);
    }

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
    const tTeam = this.state.match[target.team];
    const t = tTeam.balls[target.idx];

    if (t.status !== BallStatus.Eliminated && t.status !== BallStatus.Contesting) {
      t.status -= 1;
      t.hitBy.shift();
    } else if (t.status !== BallStatus.Eliminated) {
      throw new Error(`${t.label} is already eliminated!`);
    } else {
      throw new Error(`${t.label} is not locked!`);
    }
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

    let rescue = null;

    // Check whether is proper hit or miss hit
    if (src.team !== target.team) {
      // Proper Hit
      // Source
      s.hits.push(t.label);
      s.activeHits.push(t.label);

      // Target
      t.hitBy.push(s.label);
      t.status += 1;

      // Check whether target is eliminated
      if (t.status === BallStatus.Eliminated) {
        // Remove target from source's active list
        s.activeHits = s.activeHits.filter(ball => ball !== t.label);

        // Remove the eliminated ball from team active list
        tTeam.activeHits = tTeam.activeHits.filter(ball => ball !== t.label);

        // Nullify eliminated sequence
        // this.nullify('eliminate', t.label);
      }

      // Get rescue ball if exist
      if (t.activeHits.length > 0) {
        rescue = this.convertBall(t.activeHits.shift() as string);

        // Check if target has any active hits, if so transfer to team active lists
        if (t.status === BallStatus.Eliminated) {
          tTeam.activeHits.push(...t.activeHits);

          // Clear eliminated's ball active hit list
          t.activeHits = [];
        }
      } else {
        // Check the target's team active list
        if (tTeam.activeHits.length > 0) {
          rescue = this.convertBall(tTeam.activeHits.shift() as string);
        }
      }
    } else {
      // Miss Hit
      const missHitConfig = this.state.info.rules.config.missHit;

      s.status = Math.min(BallStatus.Eliminated, s.status + missHitConfig.sourcePenalty);
      t.status = Math.min(BallStatus.Eliminated, t.status + missHitConfig.targetPenalty);

      // console.log(this.state.match.r.balls[0]);
      // console.log(this.state.match.r.balls[1]);
    }
    return rescue;
  }
}

// const cm = new CommandManager();

const w = new Wiser();

w.process('r1r2');

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
