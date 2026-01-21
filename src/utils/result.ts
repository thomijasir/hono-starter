/**
 * The Result Type: A Discriminated Union.
 */
export type ResultType<T, E = Error> =
  | { ok: true; val: T }
  | { ok: false; err: E };

/**
 * The Result Async Type: A Discriminated Union.
 */
export type ResultAsyncType<T, E = Error> = Promise<ResultType<T, E>>;

/**
 * Helper to create a Success Result
 */
export const Ok = <T>(value: T): ResultType<T, never> => {
  return { ok: true, val: value };
};

/**
 * Helper to create a Failure Result
 */
export const Err = <E>(error: E): ResultType<never, E> => {
  return { ok: false, err: error };
};

/**
 * Static Utility Class for handling Async/Sync operations
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Result {
  /**
   * Wraps a Promise. Catches rejection and returns a Result Object.
   * Usage: const result = await Result.async(somePromise);
   */
  static async async<T, E = Error>(promise: Promise<T>): ResultAsyncType<T, E> {
    try {
      const data = await promise;
      return { ok: true, val: data };
    } catch (err) {
      return { ok: false, err: err as E };
    }
  }

  /**
   * Wraps a Synchronous function that might throw.
   * Usage: const result = Result.sync(() => JSON.parse(str));
   */
  static sync<T, E = Error>(fn: () => T): ResultType<T, E> {
    try {
      const data = fn();
      return { ok: true, val: data };
    } catch (err) {
      return { ok: false, err: err as E };
    }
  }
}
