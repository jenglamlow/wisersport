export const removeFirst = (arr: any[], value: string) => {
  const idx = arr.findIndex((elem: any) => elem === value);
  if (idx !== -1) {
    arr.splice(idx, 1);
  }
};

export const removeFirstTeamBall = (arr: any[], team: string) => {
  const regex = new RegExp(`${team}\\d`, 'g');
  const match = arr.filter(ball => ball.match(regex));

  if (match.length > 0) {
    removeFirst(arr, match[0]);
    return match[0];
  }

  return null;
};
