export class UserAlreadyExistsError extends Error {
  readonly _tag = "UserAlreadyExistsError";
  constructor(email: string) {
    super(`User already exists: ${email}`);
  }
}

export class HashError extends Error {
  readonly _tag = "HashError";
  constructor(message = "Failed to hash password") {
    super(message);
  }
}

export class DbError extends Error {
  readonly _tag = "DbError";
  constructor(message = "Database error", cause?: unknown) {
    super(message, { cause });
    this.cause = cause;
  }
}

export class JwtSignError extends Error {
  readonly _tag = "JwtSignError";
  constructor(message = "Failed to sign JWT") {
    super(message);
  }
}
