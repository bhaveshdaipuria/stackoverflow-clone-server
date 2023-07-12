import { Configuration, OpenAIApi } from "openai";
import nodemailer from "nodemailer";
import OTPSchema from'../models/Otp.js';

function expireOTP(setUser){
    setTimeout(async()=>{
        await OTPSchema.deleteOne(setUser)
    }, 300000)
}

export const generateOTP = async(req, res)=>{

    const {clientMail, user} = req.body

    try {
        const generatedOTP = await OTPSchema.findOne({user})
        const otp = Math.floor(1000 + Math.random() * 9000);
        const transport = nodemailer.createTransport({
        service:'gmail',
         auth: {
                   user: process.env.EMAIL_ID,
                   pass: process.env.EMAIL_PASS
              }
         });
        const mailOptions = {
              from: process.env.EMAIL_ID, 
              to: clientMail,
              subject: "Your OTP for chatbot", 
              text: `Your generated OTP is ${otp}. It will expire in 5 minutes`
          }
        transport.sendMail(mailOptions, function(error, response){
            if(error){
               res.json({error: error});
               console.log('Error');
             }else{
               res.json({success: "Email has been sent successfully"});
             }
            })
        if(generatedOTP){
            await OTPSchema.findOneAndReplace({user}, {user: user, otp: otp});
            expireOTP({user: user})
        }
        else{
            await OTPSchema.create({
                user: user,
                otp: otp
            })
            expireOTP({user: user})
        }
        } catch (error) {
        console.error(error)
        }
}

export const verifyOTP = async(req, res)=>{
    const {enteredOTP, user} = req.body;
    try {
        const currentUser = await OTPSchema.findOne({user})
        if(currentUser){
            if(enteredOTP == currentUser.otp){
                res.json({success: currentUser.otp})
                await OTPSchema.deleteOne({user});
            }else{
                res.json({failure: 'Wrong OTP entered'});
            }
                }else{
                res.json({failure: 'Please login first'})
                }
            }
             catch (error) {
        console.error(error);
    }
}

export const askChatbot = async(req, res)=>{

    const {chatbotQues} = req.body;

    const configuration = new Configuration({
        apiKey: process.env.OPEN_AI_KEY
    });

    const openai = new OpenAIApi(configuration);

    try{
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: chatbotQues,
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    })
    res.json({"message" :response.data.choices[0].text});
    }catch(error){
        console.error(error);
    }
}
