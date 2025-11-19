import consola from "consola";

export const logger = {
  log: (...args: string[] | unknown[]) => {
    return consola.log(args.map(arg => arg).join(' '));
  },
  warn: (...args: string[] | unknown[]) => {
    return consola.warn(args.map(arg => arg).join(' '));
  },
  error: (...args: string[] | unknown[]) => {
    return consola.error(args.map(arg => arg).join(' '));
  },
};
