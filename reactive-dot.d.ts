import type { config } from "./reactive-dot.config.ts";

declare module "@reactive-dot/core" {
  export interface Register {
    config: typeof config;
  }
}
