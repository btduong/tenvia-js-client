/**
 *  A utility function that pauses an async function for a given duration.
 * 
 * @param duration - miliseconds to wait
 * @returns a Promise resolves after the timeout
 */
export const waitFor = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));