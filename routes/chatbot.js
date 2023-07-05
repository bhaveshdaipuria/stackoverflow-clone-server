import express from 'express';
import { askChatbot, generateOTP, verifyOTP } from '../controllers/chatbot.js';

const router = express.Router();

router.post('/askchatbot', askChatbot);
router.post('/chatotp', generateOTP);
router.post('/verifyotp', verifyOTP);

export default router;