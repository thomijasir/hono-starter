/**
 * The Result Type: A Tuple.
 * Index 0 is the Error (or null).
 * Index 1 is the Value (or null).
 */
export type ResultType<T, E = Error> = [E, null] | [null, T];

/**
 * Helper to create a Success Result
 */
export const Ok = <T,>(value: T): ResultType<T, never> => {
  return [null, value];
};

/**
 * Helper to create a Failure Result
 */
export const Err = <E,>(error: E): ResultType<never, E> => {
  return [error, null];
};

/**
 * Static Utility Class for handling Async/Sync operations
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Result {
  /**
   * Wraps a Promise. Catches rejection and returns a Tuple Result.
   * Usage: const [err, data] = await ResultHandler.async(somePromise);
   */
  static async async<T, E = Error>(
    promise: Promise<T>,
  ): Promise<ResultType<T, E>> {
    try {
      const data = await promise;
      return [null, data];
    } catch (err) {
      return [err as E, null];
    }
  }

  /**
   * Wraps a Synchronous function that might throw.
   * Usage: const [err, data] = ResultHandler.sync(() => JSON.parse(str));
   */
  static sync<T, E = Error>(fn: () => T): ResultType<T, E> {
    try {
      const data = fn();
      return [null, data];
    } catch (err) {
      return [err as E, null];
    }
  }
}
