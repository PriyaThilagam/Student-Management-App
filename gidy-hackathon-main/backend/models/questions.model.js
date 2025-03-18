import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,
    },
    text:{
        type:String,
        required:true,
    },
    img:{
        type:String,
    },
    replies:[
        {
            text:{
                type:String,
                required:true,
            },
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            }
        }
    ]
}, {timestamps: true})

const Question = mongoose.model("Question", questionSchema)

export default Question;