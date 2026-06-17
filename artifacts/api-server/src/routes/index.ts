import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiChatRouter from "./aiChat";
import telegramRouter from "./telegram";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiChatRouter);
router.use(telegramRouter);

export default router;
