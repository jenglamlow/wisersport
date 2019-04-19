import deepDiff from 'deep-diff';

import { CommandManager, ICommand, ICommandManager } from './CommandManager';
import { BallStatus } from './Constant';
import { removeFirstTeamBall } from './utils';
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

type MissHitType = 'MY' | 'WWSC';
interface IGameRules {
  name: string;
  config: {
    points: {
      contesting: number;
      firstLocked: number;
      secondLocked: number;
      eliminated: number;
    };
    missHitType: MissHitType;
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

type RescueType = 'normal' | 'missHit';

interface IRescueBall {
  type: RescueType;
  ball: IBall;
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
    missHitType: 'MY',
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
      score: 0,
      pendingRescue: [],
      balls: [],
    },
    w: {
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
    if (rescue) {
      this.rescue(rescue as IRescueBall);
    }

    // console.log(deepDiff.diff(prevMatchState, this.state.match));
  }

  public reset() {
    this.state.match.sequences = [];
    this.state.match.r.score = 0;
    this.state.match.r.pendingRescue = [];
    this.state.match.w.score = 0;
    this.state.match.w.pendingRescue = [];

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

  private nullify(type, target) {
    const validSequence = this.state.match.sequences.filter(s => s.nullified === false);

    if (type === 'rescue') {
      const seq = validSequence.filter(s => s.action.indexOf(target.slice(0, 2)) !== -1);
      seq[0].nullified = true;
    } else {
      // eliminate mode
      const seq = validSequence.filter(s => s.action.indexOf(target.slice(0, 2)) === 2);
      seq[0].nullified = true;
      seq[1].nullified = true;
      seq[2].nullified = true;
    }
  }

  private rescue(rescueBall: IRescueBall) {
    const ball = rescueBall.ball;
    const rescueType = rescueBall.type;
    const tTeam = this.state.match[ball.team];
    const t = tTeam.balls[ball.idx];

    if (t.status !== BallStatus.Eliminated && t.status !== BallStatus.Contesting) {
      if (rescueType === 'normal') {
        t.status -= 1;
        removeFirstTeamBall(t.hitBy, ball.team === 'r' ? 'w' : 'r');
      } else {
        t.status -= 1;
        if (this.state.info.rules.config.missHitType === 'MY') {
          removeFirstTeamBall(t.activeHits, ball.team);
        } else {
          removeFirstTeamBall(t.hitBy, ball.team);
        }
      }

      // Nullify Rescued Ball Sequence
      this.nullify('rescue', t.label);
    } else if (t.status === BallStatus.Eliminated) {
      throw new Error(`${t.label} is already eliminated!`);
    } else {
      throw new Error(`${t.label} is not locked!`);
    }
  }

  private hit(src: IBall, target: IBall): IRescueBall | null {
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

    let rescue: IRescueBall | null = null;

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

        // Remove the eliminated ball from source team active list
        sTeam.pendingRescue = sTeam.pendingRescue.filter(ball => ball !== t.label);

        // Nullify eliminated sequence
        this.nullify('eliminate', t.label);
      }

      // Get rescue ball if exist
      const rescuedBall = removeFirstTeamBall(t.activeHits, src.team);

      if (rescuedBall) {
        rescue = {
          type: 'normal',
          ball: this.convertBall(rescuedBall as string),
        };

        // Check if target has any active hits, if so transfer to team active lists
        if (t.status === BallStatus.Eliminated) {
          tTeam.pendingRescue.push(...t.activeHits);

          // Clear eliminated's ball active hit list
          t.activeHits = [];
        }
      } else {
        // Check the target's team active list
        const pendingRescueBall = removeFirstTeamBall(tTeam.pendingRescue, src.team);

        if (pendingRescueBall) {
          rescue = {
            type: 'normal',
            ball: this.convertBall(pendingRescueBall as string),
          };
        }

        // Check any miss hit pending rescue
        const removedBall = removeFirstTeamBall(sTeam.pendingRescue, src.team);
        if (removedBall) {
          rescue = {
            type: 'missHit',
            ball: this.convertBall(removedBall as string),
          };
        }
      }
    } else {
      // Miss Hit
      const missHitType = this.state.info.rules.config.missHitType;
      if (missHitType === 'MY') {
        s.status += 1;
        s.activeHits.push(t.label);
        sTeam.pendingRescue.push(s.label);
      } else {
        s.status = BallStatus.Eliminated;
        sTeam.pendingRescue.push(t.label);
        t.status += 1;
        t.hitBy.push(s.label);
      }

      // Source
      s.hits.push(t.label);
    }
    return rescue;
  }
}

// const cm = new CommandManager();

// const wiser = new Wiser();

// wiser.process('r1w2');
// wiser.process('r1w2');
// wiser.process('r1w2');

// console.log(wiser.state.match.r.balls[0]);

// const change = deepDiff.diff(s0,s1);
// let t;
// // deepDiff.applyDiff(t,s0, change);
// if (change) {
//   for (const i of change) {
//     deepDiff.applyChange(s0, {}, i);
//     deepDiff.revertChange(s1, {}, i);

//   }
// }
