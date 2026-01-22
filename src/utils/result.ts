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
 * Type guard to check if a value is a ResultType
 */
export const isResult = (val: unknown): val is ResultType<unknown, unknown> => {
  return (
    !!val &&
    typeof val === "object" &&
    "ok" in val &&
    typeof (val as { ok: unknown }).ok === "boolean"
  );
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
      // Check if data is already a Result object to prevent double wrapping
      if (isResult(data)) {
        return data as unknown as ResultType<T, E>;
      }
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

  /**
   * Combines multiple promises into a list of Results.
   * Usage: const results = await Result.combine([p1, p2, p3]);
   * Returns: [Result1, Result2, Result3]
   */
  static async combine<T, E = Error>(
    promises: Promise<unknown>[],
  ): Promise<ResultType<T, E>[]> {
    const results = await Promise.allSettled(promises);
    return results.map((r) => {
      if (r.status === "fulfilled") {
        const val = r.value;
        // If the value is already a Result, return it directly
        if (isResult(val)) {
          return val as ResultType<T, E>;
        }
        return { ok: true, val: val as T };
      } else {
        return { ok: false, err: r.reason as E };
      }
    });
  }

  /**
   * Chains multiple async operations.
   * Usage: const res = await Result.chain(first, fn1, fn2);
   */
  static chain<T, T1, E>(
    first: Promise<ResultType<T, E>> | ResultType<T, E>,
    fn1: (val: T) => Promise<ResultType<T1, E>> | ResultType<T1, E>,
  ): Promise<ResultType<T1, E>>;
  static chain<T, T1, T2, E>(
    first: Promise<ResultType<T, E>> | ResultType<T, E>,
    fn1: (val: T) => Promise<ResultType<T1, E>> | ResultType<T1, E>,
    fn2: (val: T1) => Promise<ResultType<T2, E>> | ResultType<T2, E>,
  ): Promise<ResultType<T2, E>>;
  static chain<T, T1, T2, T3, E>(
    first: Promise<ResultType<T, E>> | ResultType<T, E>,
    fn1: (val: T) => Promise<ResultType<T1, E>> | ResultType<T1, E>,
    fn2: (val: T1) => Promise<ResultType<T2, E>> | ResultType<T2, E>,
    fn3: (val: T2) => Promise<ResultType<T3, E>> | ResultType<T3, E>,
  ): Promise<ResultType<T3, E>>;
  static chain<T, T1, T2, T3, T4, E>(
    first: Promise<ResultType<T, E>> | ResultType<T, E>,
    fn1: (val: T) => Promise<ResultType<T1, E>> | ResultType<T1, E>,
    fn2: (val: T1) => Promise<ResultType<T2, E>> | ResultType<T2, E>,
    fn3: (val: T2) => Promise<ResultType<T3, E>> | ResultType<T3, E>,
    fn4: (val: T3) => Promise<ResultType<T4, E>> | ResultType<T4, E>,
  ): Promise<ResultType<T4, E>>;
  static async chain<T, E = Error>(
    first: Promise<ResultType<T, E>> | ResultType<T, E>,
    ...fns: ((
      val: unknown,
    ) => Promise<ResultType<unknown, E>> | ResultType<unknown, E>)[]
  ): Promise<ResultType<unknown, E>> {
    let result: ResultType<unknown, E> = await first;
    for (const fn of fns) {
      if (!result.ok) {
        return result;
      }
      result = await fn(result.val);
    }
    return result;
  }
}
