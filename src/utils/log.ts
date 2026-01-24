/* eslint-disable no-console */

import { ENVIRONMENT } from "~/constants";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogFn {
  (msg: string, ...args: unknown[]): void;
  (obj: object, msg?: string, ...args: unknown[]): void;
}

class Logger {
  private level: LogLevel = "info";

  constructor() {
    // Determine environment explicitly
    const env = ENVIRONMENT.NODE_ENV;
    // Default to strict JSON in production, Pretty in development
    this.isProduction = env === "production";
  }

  private isProduction: boolean;

  private formatTime(): string {
    return new Date().toISOString();
  }

  private serialize(
    level: LogLevel,
    msg: string,
    obj?: object,
    ...args: unknown[]
  ) {
    if (this.isProduction) {
      const logData = {
        level,
        time: Date.now(),
        msg,
        ...obj,
      };
      if (args.length > 0) {
        Object.assign(logData, { args });
      }
      return JSON.stringify(logData);
    }

    // Pretty printing for Development
    const time = this.formatTime().slice(11, 19);

    // ANSI Colors
    const reset = "\x1b[0m";
    const gray = "\x1b[90m";
    const white = "\x1b[37m";

    let levelColor = "\x1b[32m"; // Default (Info) - Green
    if (level === "warn") levelColor = "\x1b[33m"; // Yellow
    if (level === "error") levelColor = "\x1b[31m"; // Red
    if (level === "debug") levelColor = "\x1b[34m"; // Blue

    const levelStr = level.toUpperCase().padEnd(5);

    let output = `${gray}${time}${reset} ${levelColor}${levelStr}${reset} ${white}${msg}${reset}`;

    if (obj && Object.keys(obj).length > 0) {
      output += ` ${gray}${JSON.stringify(obj)}${reset}`;
    }

    if (args.length > 0) {
      output += ` ${JSON.stringify(args)}`;
    }

    return output;
  }

  private dispatch(
    level: LogLevel,
    arg1: string | object,
    arg2?: unknown,
    ...moreArgs: unknown[]
  ) {
    let msg = "";
    let obj = {};
    const args: unknown[] = [];

    if (typeof arg1 === "string") {
      msg = arg1;
      if (typeof arg2 !== "undefined") args.push(arg2);
      args.push(...moreArgs);
    } else {
      obj = arg1;
      if (typeof arg2 === "string") {
        msg = arg2;
        args.push(...moreArgs);
      } else {
        if (typeof arg2 !== "undefined") args.push(arg2);
        args.push(...moreArgs);
      }
    }

    const output = this.serialize(level, msg, obj, ...args);

    switch (level) {
      case "debug":
      case "info":
        console.log(output);
        break;
      case "warn":
        console.warn(output);
        break;
      case "error":
        console.error(output);
        break;
    }
  }

  public debug: LogFn = (arg1, arg2?, ...args) => {
    this.dispatch("debug", arg1, arg2, ...args);
  };
  public info: LogFn = (arg1, arg2?, ...args) => {
    this.dispatch("info", arg1, arg2, ...args);
  };
  public warn: LogFn = (arg1, arg2?, ...args) => {
    this.dispatch("warn", arg1, arg2, ...args);
  };
  public error: LogFn = (arg1, arg2?, ...args) => {
    this.dispatch("error", arg1, arg2, ...args);
  };
}

export const log = new Logger();
export type LogType = typeof log;
