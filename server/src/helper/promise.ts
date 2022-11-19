export const collectAllSettledresult = <T>(arg: PromiseSettledResult<T>[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errors: any[] = [];
  const data: T[] = [];

  arg.forEach((v) => {
    if (v.status === "rejected") {
      errors.push(v.reason);
    } else if (v.status === "fulfilled") {
      data.push(v.value);
    }
  });

  return { errors, data };
};
