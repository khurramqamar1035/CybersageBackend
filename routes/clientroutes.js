import express from "express";
import { createClient, getClients, updateClient, deleteClient } from "../controllers/clientcontroller.js";
import { adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getClients);                        // Public — read
router.post("/", adminOnly, createClient);          // Admin only
router.put("/:id", adminOnly, updateClient);        // Admin only
router.delete("/:id", adminOnly, deleteClient);     // Admin only

export default router;
