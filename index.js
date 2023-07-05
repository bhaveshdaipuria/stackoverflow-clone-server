import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";
import questionRoutes from "./routes/Questions.js";
import answerRoutes from "./routes/Answers.js";
import connectDB from "./connectMongoDb.js";
import chatbotRoutes from './routes/chatbot.js';
import path from 'path';

dotenv.config();
connectDB();
const app = express();
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use("/user", userRoutes);
app.use("/questions", questionRoutes);
app.use("/answer", answerRoutes);
app.use('/chatbot', chatbotRoutes);

app.get('*', function(req, res){
  res.sendFile(path.join(__dirname, '../client/build/index.html'))
})

const PORT = process.env.PORT || 7001;

  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});