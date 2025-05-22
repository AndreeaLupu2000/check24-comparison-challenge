// src/config/index.ts
import dotenv from "dotenv";
dotenv.config();

// Export the config object
export const config = {
  // API Keys
  BYTE_ME_API_KEY: process.env.BYTE_ME_API_KEY!,
  WEB_WUNDER_API_KEY: process.env.WEB_WUNDER_API_KEY!,
  PING_PERFECT_SECRET: process.env.PING_PERFECT_SIGNATURE_SECRET!,
  PING_PERFECT_CLIENT_ID: process.env.PING_PERFECT_CLIENT_ID!,
  VERBYNDICH_API_KEY: process.env.VERBYNDICH_API_KEY!,
  SERVUS_USERNAME: process.env.SERVUS_SPEED_USERNAME!,
  SERVUS_PASSWORD: process.env.SERVUS_SPEED_PASSWORD!,

  // URLs 
  BYTE_ME_BASE_URL: "https://byteme.gendev7.check24.fun/app/api/products/data",
  WEB_WUNDER_BASE_URL: "https://webwunder.gendev7.check24.fun:443/endpunkte/soap/ws",
  PING_PERFECT_BASE_URL: "https://pingperfect.gendev7.check24.fun",
  VERBYNDICH_BASE_URL: "https://verbyndich.gendev7.check24.fun/check24/data",
  SERVUS_BASE_URL: "https://servus-speed.gendev7.check24.fun",

  // Defaults
  DEFAULT_COUNTRY: "DE",
  API_TIMEOUT_MS: 3000,
};
