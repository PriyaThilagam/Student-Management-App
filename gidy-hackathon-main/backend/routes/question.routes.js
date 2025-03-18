import express from "express"
import { protectRoute } from "../middleware/protectRoute.js";
import { createQuestion, deleteQuestion, commentOnQuestion, getAllQuestions, getFollowingQuestions, getUserQuestions } from "../controllers/question.controller.js";

const router = express.Router();

router.get("/allQuestions", protectRoute, getAllQuestions);
router.post("/create", protectRoute, createQuestion);
router.post("/comment/:id", protectRoute, commentOnQuestion);
router.delete("/:id", protectRoute, deleteQuestion);
router.get("/following", protectRoute, getFollowingQuestions);
router.get("/user/:username", protectRoute, getUserQuestions);

export default router;