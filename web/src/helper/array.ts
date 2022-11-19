export const average = (arr: number[]) => {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
};
