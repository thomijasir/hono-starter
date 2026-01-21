import { Result } from "./result";

/**
 * Hashes a plain text password using bcrypt.
 *
 * @param {string} text - The password to hash.
 * @returns {Result<string, unknown>} A Result containing the hashed password or an error.
 */
export const passwordHash = (text: string) =>
  Result.async(Bun.password.hash(text, { algorithm: "bcrypt", cost: 10 }));

/**
 * Verifies a plain text password against a hashed verifier.
 *
 * @param {string} password - The plain text password to verify.
 * @param {string} verifier - The hashed password to check against.
 * @returns {Result<boolean, unknown>} A Result containing true if the password matches, false otherwise, or an error.
 */
export const verifyPassword = (password: string, verifier: string) =>
  Result.async(Bun.password.verify(password, verifier));
