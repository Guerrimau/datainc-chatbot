export const waitTime = (ms: number) => {
  return new Promise((resolve) => {
      setTimeout(() => {
          resolve(ms)
      }, ms)
  })
}