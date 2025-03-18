import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";


export const getUserProfile = async (req, res) => {
    const {username} = req.params;

    try {
        const user = await User.findOne({username}).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(201).json(user);
    } catch (error) {
        console.log("Error in getUserProfile Controller", error);
        res.status(500).json({ error: "Error fetching user profile" });
    }
};

export const followUnfollowUser = async (req, res) => {
    try {
        const {id} = req.params;
        const userToFollow = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if( id === currentUser) {
            return res.status(400).json({ message: "You cannot follow/unfollow yourself" });
        }

        if(!userToFollow || !currentUser)
        {
            return res.status(400).json({error: "User not found"});
        }

        const isFollowing = currentUser.following.includes(id);
        if(isFollowing) {
            await User.findByIdAndUpdate(id, {$pull: {followers: req._id}});
            await User.findByIdAndUpdate(req.user._id, {$pull: {following: id}});
            return res.status(200).json({message: "Unfollowed user" });
        }
        else{
            await User.findByIdAndUpdate(id, {$push: {followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, {$push: {following: id}});
            return res.status(200).json({message: "Followed user" });
        }
    } catch (error) {
        console.log("Error in followUnfollowUser Controller", error);
        res.status(500).json({ error: "Error following user" });
    }
};

export const getSuggestedUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const userFollowed = await User.findById(userId).select("following");
        

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId },
                }
            },
            {
                $sample:{size:10}
            }
        ])
        const filterUsers = users.filter(user=>!userFollowed.following.includes(user._id));
        const suggestedUsers = filterUsers.slice(0,5);
        suggestedUsers.forEach((user) => (user.password = null));
        return res.status(200).json(suggestedUsers);
    } catch (error) {
        console.log("Error in getSuggestedUser Controller", error);
        res.status(500).json({ error: "Error Fetching Suggested user" });
    }
};

export const updateProfile = async (req, res) => {
    const{fullName, email, username, currentPassword, newPassword, bio, link} = req.body;
    let { profileImg, coverImg } = req.body;

    const userId = req.user._id;
    
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({error: "User not found"});
        }

        if((!newPassword && currentPassword) || (!currentPassword && newPassword)){
            return res.status(400).json({error: "Current Password or New Password cannot be empty"})
        }

        if( currentPassword && newPassword ){
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(400).json({error: "Current Password is wrong"});
            }
            if(newPassword.length < 6){
                return res.status(400).json({error: "Password must be at least 6 characters"});
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if(profileImg){
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;
        }

        if(coverImg){
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        var user1 = await user.save();

        user1.password = null;
        return res.status(200).json(user1);

    } catch (error) {
        console.log("Error in updateProfile Controller", error);
        res.status(500).json({ error: "Error Updating profile" });
    }
};