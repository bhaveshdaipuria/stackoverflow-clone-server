import nodemailer from "nodemailer";
import OTPSchema from "../models/Otp.js";
import { GoogleGenAI } from "@google/genai";

function expireOTP(setUser) {
	setTimeout(async () => {
		await OTPSchema.deleteOne(setUser);
	}, 300000);
}

export const generateOTP = async (req, res) => {
	const { clientMail, user } = req.body;

	try {
		const generatedOTP = await OTPSchema.findOne({ user });
		const otp = Math.floor(1000 + Math.random() * 9000);
		const transport = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.EMAIL_ID,
				pass: process.env.EMAIL_PASS,
			},
		});
		const mailOptions = {
			from: process.env.EMAIL_ID,
			to: clientMail,
			subject: "Your OTP for chatbot",
			text: `Your generated OTP is ${otp}. It will expire in 5 minutes`,
		};
		transport.sendMail(mailOptions, function(error, response) {
			if (error) {
				res.json({ error: error });
				console.log("Error");
			} else {
				res.json({ success: "Email has been sent successfully" });
			}
		});
		if (generatedOTP) {
			await OTPSchema.findOneAndReplace({ user }, { user: user, otp: otp });
			expireOTP({ user: user });
		} else {
			await OTPSchema.create({
				user: user,
				otp: otp,
			});
			expireOTP({ user: user });
		}
	} catch (error) {
		console.error(error);
	}
};

export const verifyOTP = async (req, res) => {
	const { enteredOTP, user } = req.body;
	try {
		const currentUser = await OTPSchema.findOne({ user });
		if (currentUser) {
			if (enteredOTP == currentUser.otp) {
				res.json({ success: currentUser.otp });
				await OTPSchema.deleteOne({ user });
			} else {
				res.json({ failure: "Wrong OTP entered" });
			}
		} else {
			res.json({ failure: "Please login first" });
		}
	} catch (error) {
		console.error(error);
	}
};

export const askChatbot = async (req, res) => {
	const { chatbotQues } = req.body;

	const geminiBot = new GoogleGenAI({
		apiKey: process.env.GEMINI_API_KEY,
	});

	try {
		const response = await geminiBot.models.generateContent({
			model: process.env.GEMINI_MODEL,
			contents: chatbotQues,
			config: {
				systemInstruction: `You are a coding assistant and you only answer programming related questions. If the question is not related to programming, respond with "I am a coding assistant and I can only help with programming related questions."`,
			},
		});

		return res.status(200).json({ message: response.text });
	} catch (error) {
		console.error(error.type);
		if (error.type === "insufficient_quota") {
			res.status(429).json({ insufficient_quota: true });
		}
	}
};
