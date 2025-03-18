import User from "../models/user.model.js";
import Question from "../models/questions.model.js";

export const createQuestion = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        if(!text && !img) {
            return res.status(400).json({error: "Question or image is required"});
        }

        if(img) {
            const uploadResponse = await cloudinary.uploader.upload(img);
            img = uploadResponse.secure_url;
        }

        const newQuestion = new Question({
            user:userId,
            text: text,
            img: img
        });
        await newQuestion.save();
        res.status(201).json({message: "Question created successfully",newQuestion});
    } catch (error) {
        console.log("Error in createQuestion Controller", error);
        res.status(500).json({error: "Error creating question"});
    }
}

export const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if(!question){
            return res.status(404).json({error: "Question not found"});
        }

        if(question.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({error: "You are not authorized to delete this question"});
        }

        if(question.img) {
            const imageId = question.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imageId);
        }

        await Question.findByIdAndDelete(req.params.id);
        res.status(200).json({message: "Question deleted successfully"});
    } catch (error) {
        console.log("Error in deleteQuestion Controller", error);
        res.status(500).json({error: "Error deleting question"});
    }
}

export const commentOnQuestion = async (req,res) => {
    try {
        const { text } = req.body;
        const questionId = req.params.id;
        const userId = req.user._id

        if(!text) {
            return res.status(400).json({error: "Question is required"});
        }

        const question = await Question.findById(questionId);
        if(!question){
            return res.status(404).json({error: "Question not found"});
        }

        const comment = {user: userId, text}

        question.replies.push(comment);
        await question.save();

        res.status(200).json({message: "Comment added successfully"});

    } catch (error) {
        console.log("Error in comment Controller", error);
        res.status(500).json({error: "Error commenting"});
    }
}

export const getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find().sort({ createdAt: -1 }).populate({
            path: 'user',
            select: "-password"
        })
        .populate({
            path: 'replies.user',
            select: "-password"
        });

        if(questions.length === 0) {
            return res.status(404).json([]);
        }

        res.status(200).json(questions);
    } catch (error) {
        console.log("Error in getAllQuestions Controller", error);
        res.status(500).json({error: "Error fetching questions"});
    }
}

export const getFollowingQuestions = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const following = user.following;

		const feedQuestions = await Question.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "replies.user",
				select: "-password",
			});

		res.status(200).json(feedQuestions);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserQuestions = async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const questions = await Question.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "replies.user",
				select: "-password",
			});

		res.status(200).json(questions);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};