export const minBy = <T>(arr: T[], fn: (v: T) => number) => {
  return arr.reduce((acc, v) => {
    const accValue = fn(acc);
    const vValue = fn(v);
    return vValue < accValue ? v : acc;
  });
};
