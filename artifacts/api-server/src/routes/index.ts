import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiChatRouter from "./aiChat";
import telegramRouter from "./telegram";
import adminRouter from "./admin";
import premiumRouter from "./premium";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiChatRouter);
router.use(telegramRouter);
router.use(adminRouter);
router.use(premiumRouter);

export default router;
