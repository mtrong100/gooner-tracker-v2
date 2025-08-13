import express from "express";
import postRoutes from "./post.routes.js";
import timeRoutes from "./time.routes.js";
import userRoutes from "./user.routes.js";

const router = express.Router();

router.use("/posts", postRoutes);
router.use("/times", timeRoutes);
router.use("/users", userRoutes);

export default router;
