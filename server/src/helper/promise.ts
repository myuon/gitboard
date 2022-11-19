export const collectAllSettledresult = <T>(arg: PromiseSettledResult<T>[]) => {
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
