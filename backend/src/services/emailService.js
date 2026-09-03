const nodemailer=require('nodemailer');
let transporter;
function getTransporter(){if(transporter)return transporter;transporter=nodemailer.createTransport({host:process.env.SMTP_HOST||'smtp.gmail.com',port:Number(process.env.SMTP_PORT)||587,secure:String(process.env.SMTP_SECURE||'false')==='true',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});return transporter;}
async function sendEmail({to,subject,html,text}){if(!process.env.SMTP_USER||!process.env.SMTP_PASS)throw new Error('SMTP_USER and SMTP_PASS must be configured');return getTransporter().sendMail({from:process.env.SMTP_FROM||process.env.SMTP_USER,to,subject,text,html});}
async function sendVerificationCode(to,code){return sendEmail({to,subject:'Verify your OSTA E-Learning account',text:`Your OSTA verification code is ${code}. It expires in 15 minutes.`,html:`<p>Your OSTA E-Learning verification code is:</p><h2>${code}</h2><p>This code expires in 15 minutes.</p>`});}
async function sendPasswordResetCode(to,code){return sendEmail({to,subject:'OSTA password reset code',text:`Your OSTA password reset code is ${code}. It expires in 15 minutes.`,html:`<p>Your OSTA password reset code is:</p><h2>${code}</h2><p>This code expires in 15 minutes.</p>`});}
module.exports={sendEmail,sendVerificationCode,sendPasswordResetCode};
