import * as fs from "fs";
import * as path from "path";

export const isProduction = () => process.env.NODE_ENV === "production";
export const isDevelopment = () => process.env.NODE_ENV === "development";
export const isLocal = () =>
  process.env.NODE_ENV === "local" || process.env.NODE_ENV === undefined;

export const currentENV = () =>
  isProduction() ? "production" : isDevelopment() ? "development" : "local";

export const getCertKey = () => {
  const certPathMap = {
    production: {
      key: "/etc/letsencrypt/live/record-useful.kro.kr/privkey.pem",
      cert: "/etc/letsencrypt/live/record-useful.kro.kr/fullchain.pem",
    },
    development: {},
    local: {
      key: path.resolve(process.cwd(), "cert/privkey.pem"),
      cert: path.resolve(process.cwd(), "cert/fullchain.pem"),
    },
  };
  const envCert = certPathMap[process.env.NODE_ENV];

  return {
    key: fs.readFileSync(envCert.key),
    cert: fs.readFileSync(envCert.cert),
  };
};
