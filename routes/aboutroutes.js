import express from "express";
import {
  getTeamMembers,
  createTeamMember,
  getOffices,
  createOffice
} from "../controllers/aboutcontroller.js";
import { publicReadLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Every route in this file is rate limited.
router.use(publicReadLimiter);

// TEAM
router.get("/team", getTeamMembers);
router.post("/team", createTeamMember);

// OFFICES
router.get("/offices", getOffices);
router.post("/offices", createOffice);

export default router;
