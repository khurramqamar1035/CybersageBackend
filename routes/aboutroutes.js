import express from "express";
import {
  getTeamMembers,
  createTeamMember,
  getOffices,
  createOffice
} from "../controllers/aboutcontroller.js";

const router = express.Router();

// TEAM
router.get("/team", getTeamMembers);
router.post("/team", createTeamMember);

// OFFICES
router.get("/offices", getOffices);
router.post("/offices", createOffice);

export default router;
