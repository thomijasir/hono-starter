import { ResultAsync } from "neverthrow";
import { HashError } from "~/model";

export const hashPassword = (plain: string) =>
  ResultAsync.fromPromise(
    Bun.password.hash(plain, { algorithm: "bcrypt", cost: 10 }), // consider 10-12 in prod
    () => new HashError(),
  );

export const verifyPassword = (password: string, verifier: string) =>
  ResultAsync.fromPromise(
    Bun.password.verify(password, verifier),
    () => new HashError(),
  );
