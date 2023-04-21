import express, {
  Application,
  Express,
  NextFunction,
  Request,
  Response,
} from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import helmet from "helmet";
import { logger } from "./util/logger";
import * as config from "./util/config";
import { router } from "./router/router";
import passport from "passport";
import { authAPIKey, fabricAPIKeyStrategy } from "./auth";

export async function createServer(): Promise<Application> {
  const app: Express = express();
  if (process.env.NODE_ENV === "development") {
    app.use(cors());
  }

  if (process.env.NODE_ENV === "production") {
    app.use(helmet());
  }
  //body-parser
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  //passport
  passport.use(fabricAPIKeyStrategy);
  app.use(passport.initialize());

  console.log(app.locals)

  app.use("/api/v1", authAPIKey, router);
  logger.info("Starting RestAPI");
  app.listen(config.port, () => {
    logger.info(
      `RestAPI server started on port http://localhost:${config.port}/api/v1`
    );
  });

  return app;
}
