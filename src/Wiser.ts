import deepDiff from 'deep-diff';

import { CommandManager, ICommandManager } from './CommandManager';
import { BallStatus } from './Constant';
import { IBall, IGameRules, IGameState, IRescueBall, nullifyType } from './typings';
import { isMissHitSequence, isNormalHitSequence, removeFirstTeamBall } from './utils';

const template: IGameRules = {
  name: 'WWSC',
  config: {
    points: {
      contesting: 5,
      firstLocked: 2,
      secondLocked: 1,
      eliminated: 0,
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
      score: {
        point: 0,
        contesting: 0,
        firstLocked: 0,
        secondLocked: 0,
        eliminated: 0,
      },
      pendingRescue: [],
      balls: [],
    },
    w: {
      score: {
        point: 0,
        contesting: 0,
        firstLocked: 0,
        secondLocked: 0,
        eliminated: 0,
      },
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
    // Initialize Game State
    this.state = gameState;
    this.state.info.r.name = red;
    this.state.info.w.name = white;

    this.initBallState(numOfBalls);
    this.manager = new CommandManager(this.state.match);
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

    // Compute score and check for winner
    this.computeScore();

    // Insert the command to command manager
    const command = {
      command: 'r1r2',
      diff: deepDiff.diff(prevMatchState, this.state.match),
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

    this.manager.add(command);
  }

  public undo() {
    this.manager.undo();
  }

  public redo() {
    this.manager.redo();
  }

  public reset() {
    this.state.match.sequences = [];
    this.state.match.r.score = {
      point: 0,
      contesting: 0,
      firstLocked: 0,
      secondLocked: 0,
      eliminated: 0,
    };
    this.state.match.r.pendingRescue = [];
    this.state.match.w.score = {
      point: 0,
      contesting: 0,
      firstLocked: 0,
      secondLocked: 0,
      eliminated: 0,
    };
    this.state.match.w.pendingRescue = [];
    this.state.match.winner = '';

    this.initBallState(this.state.match.r.balls.length);
  }

  private computeScore() {
    const team = ['r', 'w'];
    const points = this.state.info.rules.config.points;

    team.forEach((t) => {
      const teamScore = this.state.match[t].score;
      const teamBalls = this.state.match[t].balls;
      teamScore.contesting = teamBalls.filter((b) => b.status === BallStatus.Contesting).length;
      teamScore.firstLocked = teamBalls.filter((b) => b.status === BallStatus.FirstLocked).length;
      teamScore.secondLocked = teamBalls.filter((b) => b.status === BallStatus.SecondLocked).length;
      teamScore.eliminated = teamBalls.filter((b) => b.status === BallStatus.Eliminated).length;
      teamScore.point =
        teamScore.contesting * points.contesting +
        teamScore.firstLocked * points.firstLocked +
        teamScore.secondLocked * points.secondLocked +
        teamScore.eliminated * points.eliminated;
    });

    if (this.state.match.r.score.contesting === 0) {
      this.state.match.winner = 'w';
    } else if (this.state.match.w.score.contesting === 0) {
      this.state.match.winner = 'r';
    }
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

  private nullify(type: nullifyType, target) {
    const validSequence = this.state.match.sequences.filter((s) => !s.nullified);

    if (type === 'rescue') {
      // Find non-missHit target
      const seq = validSequence.filter((s) => isNormalHitSequence(s.action, target));
      seq[0].nullified = true;
    } else if (type === 'eliminate') {
      // eliminate mode
      const seq = validSequence.filter((s) => s.action.indexOf(target.slice(0, 2)) === 2);
      seq[0].nullified = true;
      seq[1].nullified = true;
      seq[2].nullified = true;
    } else {
      // Rescue Miss Hit
      const seq = validSequence.filter((s) => isMissHitSequence(s.action, target));
      seq[0].nullified = true;
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

        // Nullify Rescued Ball Sequence
        this.nullify('rescue', t.label);
      } else {
        t.status -= 1;
        removeFirstTeamBall(t.hitBy, ball.team);

        // Nullify Rescued Ball Sequence
        this.nullify('rescueMissHit', t.label);
      }
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
        s.activeHits = s.activeHits.filter((ball) => ball !== t.label);

        // Remove the eliminated ball from source team active list
        sTeam.pendingRescue = sTeam.pendingRescue.filter((ball) => ball !== t.label);

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
      s.status = BallStatus.Eliminated;
      t.status += 1;
      t.hitBy.push(s.label);

      // Move the eliminated source's pending rescue to the team's pending rescue
      if (t.status === BallStatus.Eliminated) {
        tTeam.pendingRescue.push(...t.activeHits);

        // Clear eliminated's ball active hit list
        t.activeHits = [];

        // Nullify eliminated sequence
        this.nullify('eliminate', t.label);
      }
      // Transfer active hit to team's pending rescue
      sTeam.pendingRescue.push(...s.activeHits);

      // Pending Rescue miss-hitted target
      sTeam.pendingRescue.push(t.label);

      // Source
      s.hits.push(t.label);
    }
    return rescue;
  }
}

// const wiser = new Wiser();

// wiser.process('r1w2');
// wiser.process('r1w3');
// wiser.process('r3w4');

// console.log(wiser.state.match.r.balls[0]);
