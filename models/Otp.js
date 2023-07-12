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
    }
})

export default mongoose.model("chatotplist", OTPSchema);