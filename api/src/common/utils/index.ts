export * from './fetch-discord-me';

export const delay = (time: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });
