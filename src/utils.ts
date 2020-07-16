export const removeFirst = (arr: any[], value: string) => {
  const idx = arr.findIndex((elem: any) => elem === value);
  if (idx !== -1) {
    arr.splice(idx, 1);
  }
};

export const removeFirstTeamBall = (arr: any[], team: string) => {
  const regex = new RegExp(`${team}\\d`, 'g');
  const match = arr.filter((ball) => ball.match(regex));

  if (match.length > 0) {
    removeFirst(arr, match[0]);
    return match[0];
  }

  return null;
};

export const isNormalHitSequence = (action: string, target: string) => {
  const opposingTeam = target[0] === 'r' ? 'w' : 'r';
  const regex = new RegExp(`${opposingTeam}\\d${target}`, 'g');
  const match = action.match(regex);

  return match !== null;
};

export const isMissHitSequence = (action: string, target: string) => {
  const regex = new RegExp(`${target[0]}\\d${target}`, 'g');

  const match = action.match(regex);

  return match !== null;
};
