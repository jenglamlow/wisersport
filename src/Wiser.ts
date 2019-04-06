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
  hitBy: [];
}

interface ITeamState {
  name: string;
  score: number;
  balls: IBallstate[];
}

interface IMatchInfo {
  winner: string;
  r: ITeamState;
  w: ITeamState;
  sequences: ISequence[];
}

export interface IGameState {
  info: IMatchInfo;
  match: IMatchInfo;
}

const gameState: IGameState = {
  info: {
    r: {
      name: ''
    },
    w: {
      name: ''
    }
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
  }
};

export class Wiser {
  public state: IGameState;
  public manager: ICommandManager;

  constructor(red: string = 'Red Team', white: string = 'White Team', numOfBalls: number = 7) {
    this.manager = new CommandManager();

    // Initialize Game State
    this.state = gameState;
    this.state.r.name = red;
    this.state.w.name = white;
    this.state.r.balls = Array(numOfBalls).fill(0).map((_, i) => ({
        label: `r${i+1}`,
        status: BallStatus.Contesting,
        foul: 0,
        hits: [],
        activeHits: [],
        hitBy: [],
      })
    );
    this.state.w.balls = Array(numOfBalls).fill(0).map((_, i) => ({
        label: `w${i+1}`,
        status: BallStatus.Contesting,
        foul: 0,
        hits: [],
        activeHits: [],
        hitBy: [],
      })
    );
  }

  public process(input: string) {
    const re = /([rw])([1-7])([frw])([mx1-7])/g;
    const match = re.exec(input);

    // Validate Input
    if (!match) {
      throw new Error(`${input} is an invalid input`);
    }

    // Generate command based on input
    const command: ICommand = {
      command: 'r1w1',
      undo: (state) => {console.log(state);},
      redo: (state) => {console.log(state);}
    };

    // Update state based on current input
    this.hit('r1','w1');
    
    // Add to CommandManager
    // this.manager.add(command);


  }

  public reset() {}

  private hit(src, target) {

  }

}


const wiser = new Wiser();

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
