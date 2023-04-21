import { logger } from "./util/logger";
import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { getReasonPhrase } from "http-status-codes";
import { HeaderAPIKeyStrategy } from "passport-headerapikey";


export const fabricAPIKeyStrategy: HeaderAPIKeyStrategy = new HeaderAPIKeyStrategy(
    {header: 'x-api-key',prefix:''},
    true,
    function(apiKey,done,req:Request){
        done(null,false)
    }
)

export const authAPIKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate(
    "headerapikey",
    { session: false },
    (err, user, _info) => {
        console.log(req.locals)
      if (err) return next(err);
      if (!user)
        return res.status(401).json({
          status: getReasonPhrase(401),
          reason: "NOT_AUTHENTICATED",
          timestamp: new Date().toISOString(),
        });

      req.logIn(user, { session: false }, async (err) => {
        if (err) {
          return next(err);
        }
        return next();
      });
    }
  )(req, res, next);
};
