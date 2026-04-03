import express from "express";
import {
  createRequest,
  getIncomingRequests,
  getAllIncomingRequests,
  getMyRequests,
  approveRequest,
  denyRequest,
} from "../controllers/shareRequestController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", createRequest);
router.get("/incoming", getIncomingRequests);
router.get("/incoming-all", getAllIncomingRequests);
router.get("/my", getMyRequests);
router.put("/:id/approve", approveRequest);
router.put("/:id/deny", denyRequest);

export default router;
