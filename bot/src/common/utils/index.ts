export const delay = (time: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, time);
  });
