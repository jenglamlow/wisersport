import { BallStatus } from './Constant';

interface ISequence {
  action: string;
  nullified: boolean;
}

export interface IBallstate {
  label: string;
  status: BallStatus;
  foul: number;
  hits: string[];
  activeHits: string[];
  hitBy: string[];
}

interface IScoreInfo {
  point: number;
  contesting: number;
  firstLocked: number;
  secondLocked: number;
  eliminated: number;
}

interface ITeamState {
  score: IScoreInfo;
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

export interface IGameRules {
  name: string;
  config: {
    points: {
      contesting: number;
      firstLocked: number;
      secondLocked: number;
      eliminated: number;
    };
  };
}

interface IGameInfo {
  rules: IGameRules;
  r: IGameTeamInfo;
  w: IGameTeamInfo;
}

export interface IBall {
  team: TeamKeys;
  idx: number;
}

type RescueType = 'normal' | 'missHit';
export interface IRescueBall {
  type: RescueType;
  ball: IBall;
}

export type nullifyType = 'rescue' | 'eliminate' | 'rescueMissHit';

export interface IGameState {
  info: IGameInfo;
  match: IMatchInfo;
}
