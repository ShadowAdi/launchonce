import { LingoDotDevEngine } from "lingo.dev/sdk";

const LINGO_DEV_API_KEY = process.env.LINGO_DEV_API_KEY || "your-secret-key-change-in-production";

export const lingoDotDev = new LingoDotDevEngine({
  apiKey: LINGO_DEV_API_KEY,
});
