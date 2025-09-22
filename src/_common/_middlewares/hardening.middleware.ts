import { HttpStatus } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

/** 불필요한 favicon 404 소음 제거 */
export function faviconFast(req: Request, res: Response, next: NextFunction) {
  if (req.path === "/favicon.ico") return res.sendStatus(204); //본문 없이 정상
  next();
}

/** 허용 HTTP 메소드 화이트리스트(Swagger/브라우저를 위해 HEAD, OPTIONS 허용) */
export function methodWhiteList(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const allowed = new Set([
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
    "HEAD",
  ]);
  if (!allowed.has(req.method)) {
    return res.sendStatus(HttpStatus.METHOD_NOT_ALLOWED); // MEHTOD_NOT_ALLOWED = 405
  }
  next();
}

/** 흔한 스캔/공격 경로를 라우팅 전에 초반 차단 (초저비용 404) */
export function pathBlocker(req: Request, res: Response, next: NextFunction) {
  const p = req.path.toLowerCase();

  const denyExact = new Set<string>([
    "/containers/json",
    "/server-status",
    "/config.json",
  ]);

  const denyPrefixes = [
    "/.git",
    "/.env",
    "/xmlrpc.php",
    "/wordpress",
    "/wp",
    "/core/skin",
    "/autodiscover",
    "/ecp",
    "/+cscoe+",
    "/vendor/phpunit",
    "/phpunit",
    "/lib/phpunit",
    "/public/vendor/phpunit",
    "/laravel/vendor/phpunit",
    "/owa",
    "/telescope",
  ];

  const denyExt = new Set([".php", ".aspx"]);

  if (denyExact.has(p)) return res.sendStatus(404);
  if (denyPrefixes.some((pref) => p.startsWith(pref)))
    return res.sendStatus(404);

  const lastDot = p.lastIndexOf(".");
  if (lastDot > -1 && denyExt.has(p.slice(lastDot))) return res.sendStatus(404);

  if (p.includes("index.php")) return res.sendStatus(404);

  next();
}
