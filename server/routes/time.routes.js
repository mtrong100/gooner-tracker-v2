import express from "express";
import {
  getTimes,
  createTime,
  updateTime,
} from "../controllers/time.controller.js";

const router = express.Router();

router.get("/", getTimes);
router.post("/", createTime);
router.put("/:id", updateTime);

export default router;
