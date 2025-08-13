import express from "express";
import {
  createUser,
  signIn,
  getUsers,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", getUsers);
router.post("/", createUser);
router.post("/signin", signIn);

export default router;
