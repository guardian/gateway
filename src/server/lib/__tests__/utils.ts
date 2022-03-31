export const fakeWait = (timeMs: number) => {
  new Promise((r) => setTimeout(r, timeMs));
  jest.runAllTimers();
};
