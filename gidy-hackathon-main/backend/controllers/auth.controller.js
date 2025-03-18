import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
    try {
        const { username, fullName, email, password } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Username already exists" });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            fullName,
            email,
            password: hashPassword,
        });

        await newUser.save();

        generateTokenAndSetCookie(newUser._id, res);

        res.status(201).json({
            success: true,
            _id: newUser._id,
            username: newUser.username,
            fullName: newUser.fullName,
            email: newUser.email,
        });
    } catch (error) {
        console.error("Error in signup controller:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    try{
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
        if (!user || !isPasswordCorrect) {
            return res.status(401).json({ success: false, message: "Invalid username or password"})
        };
        generateTokenAndSetCookie(user._id, res);
        res.status(200).json({
            success: true,
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
        });

    } catch (error) {
        console.error("Error in login controller:", error.message);
    }
};

export const logout = async (req, res) => {
    try{
        res.cookie("jwt","",{ maxAge: 0})
        res.status(201).json({message: "logged out successfully"})
    } catch (error) {
        console.error("Error in logout controller:", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const getUser = async (req, res) => {
    try{
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.error("Error in getMe controller:", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}