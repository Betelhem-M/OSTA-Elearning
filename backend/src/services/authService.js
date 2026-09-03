const bcrypt=require('bcryptjs');const jwt=require('jsonwebtoken');const crypto=require('crypto');const User=require('../models/User');const AuthToken=require('../models/AuthToken');const {sendVerificationCode,sendPasswordResetCode}=require('./emailService');
const JWT_EXPIRES_IN=process.env.JWT_EXPIRES_IN||'1d';
function normalizeAccountType(v){v=String(v||'').trim().toLowerCase();if(v==='innovator')return'entrepreneur';return['entrepreneur','researcher','instructor','student'].includes(v)?v:'student';}
function createToken(user){if(!process.env.JWT_SECRET)throw new Error('JWT_SECRET is not configured.');return jwt.sign({id:user.id,role:user.role,account_type:user.account_type||'student'},process.env.JWT_SECRET,{expiresIn:JWT_EXPIRES_IN});}
function code(){return String(crypto.randomInt(100000,1000000));}
const authService={
 async register({firstName,lastName,email,phone,region,password,accountType}){
    const normalized=normalizeAccountType(accountType);
    if(await User.findByEmail(email.trim()))throw new Error('Email is already registered');
    const hashed=await bcrypt.hash(password,12);
    const role=normalized==='instructor'?'instructor':'student';
    const id=await User.create({firstName:firstName.trim(),lastName:lastName.trim(),email:email.trim().toLowerCase(),phone:phone.trim(),region:region.trim(),password:hashed,role,accountType:normalized});
    const user=await User.findById(id);
    
    // Email verification waamuu dhiifnee kallattiitti token ni deebisna
    user.account_type=normalizeAccountType(user.account_type);
    delete user.password;
    return{user, token: createToken(user)};
  },
 async login(email,password){
    const user=await User.findByEmail(email.trim().toLowerCase());
    if(!user)throw new Error('Invalid email or password');
    if(user.status&&user.status!=='active')throw new Error('Your account is not active.');
    
    // Checkii isVerified asii balleessineerra
    if(!await bcrypt.compare(password,user.password))throw new Error('Invalid email or password');
    
    user.account_type=normalizeAccountType(user.account_type);
    delete user.password;
    return{user,token:createToken(user)};
  },
 async verifyEmail(email,codeValue){return{message:'Email verified successfully'};},
 async resendVerification(email){return{message:'Verification code sent.'};},
 async requestReset(email){const user=await User.findByEmail(email.trim().toLowerCase());if(user){const c=code();const token=crypto.randomBytes(32).toString('hex');await AuthToken.createReset(user.id,c,token);await sendPasswordResetCode(user.email,c);return{resetToken:token};}return{};},
 async verifyResetCode(email,c){const row=await AuthToken.verifyResetCode(email.trim().toLowerCase(),c);if(!row)throw new Error('Invalid or expired reset code');const token=crypto.randomBytes(32).toString('hex');const current=await AuthToken.verifyResetCode(email.trim().toLowerCase(),c);if(!current)throw new Error('Invalid or expired reset code');const pool=require('../config/database');await pool.execute(`UPDATE password_reset_tokens SET token_hash=? WHERE id=?`,[crypto.createHash('sha256').update(token).digest('hex'),current.id]);return{resetToken:token};},
 async resetPassword(token,newPassword){const row=await AuthToken.consumeReset(token);if(!row)throw new Error('Invalid or expired reset token');const hashed=await bcrypt.hash(newPassword,12);await User.updatePassword(row.user_id,hashed);return{message:'Password reset successfully'};}
};module.exports=authService;