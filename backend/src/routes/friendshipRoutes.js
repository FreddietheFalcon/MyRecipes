import express from "express";
import {
  sendRequest,
  acceptRequest,
  removeOrDeny,
  getFriends,
  getFriendRecipes,
} from "../controllers/friendshipController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// All friendship routes require login
router.use(requireAuth);

router.get("/", getFriends);
router.post("/request", sendRequest);
router.put("/:id/accept", acceptRequest);
router.delete("/:id", removeOrDeny);
router.get("/:id/recipes", getFriendRecipes);

export default router;
