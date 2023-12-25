import axios from 'axios';

export const LCRequest = axios.create({
  baseURL: 'https://leetcode.com/graphql',
});

export function throttle(func: any, delay: number) {
  let timerId: NodeJS.Timeout;
  let lastExecTime = 0;

  return function (this: any, ...args: any[]) {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay);
    }
  };
}
