import { Result } from "./result";

export const passwordHash = (text: string) =>
  Result.async(Bun.password.hash(text, { algorithm: "bcrypt", cost: 10 }));

export const verifyPassword = (password: string, verifier: string) =>
  Result.async(Bun.password.verify(password, verifier));
