import express, {
  Application,
  Express,
} from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import helmet from "helmet";
import { logger } from "./util/logger";
import * as config from "./util/config";
import { router } from "./router/router";
import passport from "passport";
import { authAPIKey, fabricAPIKeyStrategy } from "./auth";
import RedisStore from "connect-redis";
import session from "express-session";
import { createClient } from "redis";

export async function createServer(): Promise<Application> {
  const app: Express = express();

  //CORS
  if (process.env.NODE_ENV === "development") {
    app.use(cors());
  }
  if (process.env.NODE_ENV === "production") {
    app.use(helmet());
  }

  //body-parser
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  passport
  passport.use(fabricAPIKeyStrategy);
  app.use(passport.initialize());

  //redis
  let redisClient = createClient();
  redisClient.connect().catch(console.error);
  let redisStore = new RedisStore({
    client: redisClient,
    prefix: "evotesession:",
  });

  redisClient.flushAll();

  app.use(session({
    store:redisStore,
    resave: false,
    saveUninitialized: false,
    secret:"test",
    cookie:{
      secure:false,
      httpOnly: true,
      maxAge: 1000*60*10
    }
  }));

  app.use("/api/v1", router);
  // logger.info("Starting RestAPI");
  app.listen(config.port, () => {
    logger.info(
      `RestAPI server started on port http://localhost:${config.port}/api/v1`
    );
  });

  return app;
}
