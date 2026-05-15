import express from "express";
import { importFromUrl } from "../controllers/importController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);
router.post("/url", importFromUrl);

export default router;
