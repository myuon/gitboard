export const hoursMins = (secs: number) => {
  const hours = Math.floor(secs / 60 / 60);
  const minutes = Math.floor((secs - hours * 60 * 60) / 60);
  return secs ? `${hours}h ${minutes}m` : "";
};
