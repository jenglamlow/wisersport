import { IGameState } from './Wiser';

export interface ICommand {
  command: string;
  undo: (state: IGameState) => any;
  redo: (state: IGameState) => any;
}

export interface ICommandManager {
  add: (command: ICommand) => void;
  redo: (state: IGameState) => void;
  undo: (stae: IGameState) => void;
  stackList: () => ICommand[];
  stack: (i: number) => ICommand | null;
}

export class CommandManager implements ICommandManager{
  private commands: ICommand[] = [];
  private index: number = -1;
  
  public add(command: ICommand) {
    this.commands = this.commands.slice(0, this.index+1);
    this.commands.push(command);
    this.index = this.index + 1;
  }

  public redo(state: any) {
    if (this.index < this.commands.length - 1) {
      this.index += 1;
      this.commands[this.index].redo(state);
    }
  }

  public undo(state: any) {
    if (this.index >=0) {
      this.commands[this.index].undo(state);
      this.index -= 1;
    }
  }

  public stackList() {
    return this.commands.slice(0);
  }

  public stack(index: number) {
    if (index < this.commands.length - 1) {
      return this.commands[index];
    }

    return null;
  }
}