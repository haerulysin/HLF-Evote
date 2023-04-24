import { authAPIKey } from "../auth";
import { electionRouter, ballotRouter, assetRouter } from "./asset.router";
import { authRouter } from "./auth.router";
import express from "express";

export const router = express.Router();

const routeList = [
  {
    path: "/election",
    route: electionRouter,
  },
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path: "/asset",
    route: assetRouter,
  },

  {
    path: "/ballot",
    route: ballotRouter,
  },
];

for (const r of routeList) {
  if (r.path == "/auth") {
    router.use(r.path, r.route);
    continue;
  }
  router.use(r.path, authAPIKey, r.route);
}

// router.post("/", async (req, res) => {
//   const sess = req.session;
//   const { username, password } = req.body;
//   sess.username = username;
//   sess.password = password;
//   // console.log(sess)
//   return res.send(sess);
// });

router.get("/", (req, res) => {
  return res.send(req.session);
});
