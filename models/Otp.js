import mongoose from "mongoose";
const { Schema } = mongoose;

const OTPSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    otp: {
        type: Number,
        required: true,
    }, 
    expireAt: {
        type: Date,
        default: Date.now,
        expires: 300
    }
})

export default mongoose.model("chatotplist", OTPSchema);