import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim:true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim:true,
        },
        firstName:{
            type:String,
            trim:true
        },
        lastName:{
            type:String,
            trim:true
        },

        birthDate: {
            type: Date,
        },
        gender:{
            type:String,
            enum:["female","male"]
        },
        profileImg: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            default: "",
        },
        fromGoogle: {
            type: Boolean,
            default: false,
        },
        firebaseUID: { 
            type: String, 
            unique: true,
        }, 

        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: [],
            },
        ],
        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: [],
            },
        ],
        coverImg: {
            type: String,
            default: "",
        },
        link: {
            type: String,
            default: "",
        },
        likedPosts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post",
                default: [],
            },
        ],
        pings: [{ type: mongoose.Schema.Types.ObjectId, 
            ref: "User" }], 
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;