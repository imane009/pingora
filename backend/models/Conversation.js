import mongoose from "mongoose";
const conversationSchema=new mongoose.Schema({
    participants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }],
    type: {  
        type: String, 
        enum: ["group", "private"],  
        default: "private"  
    },   
    groupDetails: {  
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupDetails",
        required: false 
    },
    last_message_at: {  
        type: Date,
        default: null  
    },
    expiresAt: { type: Date, required: true }, // Date d'expiration
    
},{timestamps:true})

//  la suppression automatique de la converssation ping 
conversationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Conversation=mongoose.model("Conversation",conversationSchema)

export default Conversation;