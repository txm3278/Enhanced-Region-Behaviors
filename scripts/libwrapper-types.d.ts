declare global {
  var libWrapper: {
    register(
      packageID: string,
      target: number | string,
      fn: (fn: (...args: never) => unknown, ...args: never) => unknown,
      type?: "LISTENER" | "WRAPPER" | "MIXED" | "OVERRIDE",
      options?: { perf_mode?: "NORMAL" | "FAST" | "AUTO"; bind?: unknown[] }
    ): number;
  }
}

export {};