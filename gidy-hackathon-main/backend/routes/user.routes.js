import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js';
import { getUserProfile, followUnfollowUser, getSuggestedUser, updateProfile } from '../controllers/user.controller.js';

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/follow/:id", protectRoute, followUnfollowUser);
router.post("/suggested", protectRoute, getSuggestedUser);
router.post("/update",protectRoute,updateProfile);

export default router;