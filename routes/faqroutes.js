import express from "express";
import {
  createFAQ,
  getFAQs,
  updateFAQ,
  deleteFAQ,
} from "../controllers/faqcontroller.js";

const router = express.Router();

router.post("/", createFAQ);
router.get("/", getFAQs);
router.put("/:id", updateFAQ);
router.delete("/:id", deleteFAQ);

export default router;
