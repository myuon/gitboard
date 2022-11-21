export const average = (arr: number[]) => {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
};

export const median = (arr: number[]) => {
  const sorted = arr.sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};
