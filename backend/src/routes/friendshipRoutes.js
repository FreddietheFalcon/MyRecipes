import express from "express";
import {
  sendRequest,
  acceptRequest,
  removeOrDeny,
  getFriends,
  getFriendRecipes,
  getFriendRecipeById,
} from "../controllers/friendshipController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getFriends);
router.post("/request", sendRequest);
router.put("/:id/accept", acceptRequest);
router.delete("/:id", removeOrDeny);
router.get("/:friendId/recipes", getFriendRecipes);
router.get("/:friendId/recipes/:recipeId", getFriendRecipeById);

export default router;
