import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";

@Injectable()
export class RedirectToHttpsMiddleware implements NestMiddleware {
  use(req: any, res: any, next: NextFunction) {
    if (process.env.NODE_ENV === "production") {
      const proto = req.headers["x-forwarded-proto"];
      if (proto && proto !== "https") {
        const host = req.headers.host;
        const url = `https://${host}${req.originalUrl}`;
        return res.redirect(301, url);
      }
    }

    next();
  }
}
