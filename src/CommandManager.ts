export interface ICommand {
  command: string;
  diff: any;
  undo: (state: any, diff: any) => void;
  redo: (state: any, diff: any) => void;
}

export interface ICommandManager {
  add: (command: ICommand) => void;
  redo: () => void;
  undo: () => void;
  stackList: () => ICommand[];
  stack: (i: number) => ICommand | null;
}

export class CommandManager implements ICommandManager {
  private commands: ICommand[] = [];
  private index: number = -1;
  private state: any;

  public constructor(state: any) {
    this.state = state;
  }

  public add(command: ICommand) {
    this.commands = this.commands.slice(0, this.index + 1);
    this.commands.push(command);
    this.index = this.index + 1;
  }

  public redo() {
    if (this.index < this.commands.length - 1) {
      this.index += 1;
      const currentCommand = this.commands[this.index];
      const diff = currentCommand.diff;
      currentCommand.redo(this.state, diff);
    }
  }

  public undo() {
    if (this.index >= 0) {
      const currentCommand = this.commands[this.index];
      const diff = currentCommand.diff;
      currentCommand.undo(this.state, diff);
      this.index -= 1;
    }
  }

  public stackList() {
    return this.commands.slice(0);
  }

  public stack(index: number) {
    if (index < this.commands.length) {
      return this.commands[index];
    }

    return null;
  }
}
