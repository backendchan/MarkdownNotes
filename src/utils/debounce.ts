import { debounce as lodashDebounce, throttle as lodashThrottle } from 'lodash-es';

export const debounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
) => {
  return lodashDebounce(func, wait);
};

export const throttle = <T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
) => {
  return lodashThrottle(func, wait);
};
