import consola from 'consola'

export const logger = {
  log: (message: unknown, ...args: unknown[]) => {
    return consola.log(message, ...args)
  },
  warn: (message: unknown, ...args: unknown[]) => {
    return consola.warn(message, ...args)
  },
  error(message: unknown, ...args: unknown[]) {
    return consola.error(message, ...args)
  },
}
