import { assetRouter } from "./asset.router";
import { authRouter } from "./auth.router";
import express from 'express';

export const router = express.Router();

const routeList = [
    {
        path:'/asset',
        route:assetRouter
    },
    {
        path:'/auth',
        route: authRouter
    }
]

routeList.forEach((r) => {
    router.use(r.path,r.route);
})