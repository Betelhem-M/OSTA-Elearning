const pool=require('../config/database');
const crypto=require('crypto');
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
const AuthToken={
 async createVerification(userId,code){await pool.execute(`DELETE FROM email_verification_codes WHERE user_id=?`,[userId]);await pool.execute(`INSERT INTO email_verification_codes (user_id,code_hash,expires_at) VALUES (?,?,DATE_ADD(NOW(),INTERVAL 15 MINUTE))`,[userId,hash(code)]);},
 async verifyEmail(userId,code){const [rows]=await pool.execute(`SELECT id FROM email_verification_codes WHERE user_id=? AND code_hash=? AND expires_at>NOW() LIMIT 1`,[userId,hash(code)]);if(!rows.length)return false;await pool.execute(`UPDATE email_verification_codes SET verified_at=NOW() WHERE id=?`,[rows[0].id]);return true;},
 async isVerified(userId){const [[row]]=await pool.execute(`SELECT verified_at FROM email_verification_codes WHERE user_id=? ORDER BY id DESC LIMIT 1`,[userId]);return !row || Boolean(row.verified_at);},
 async createReset(userId,code,token){await pool.execute(`DELETE FROM password_reset_tokens WHERE user_id=?`,[userId]);await pool.execute(`INSERT INTO password_reset_tokens (user_id,code_hash,token_hash,expires_at) VALUES (?,?,?,DATE_ADD(NOW(),INTERVAL 15 MINUTE))`,[userId,hash(code),hash(token)]);},
 async verifyResetCode(email,code){const [rows]=await pool.execute(`SELECT p.id,p.user_id FROM password_reset_tokens p JOIN users u ON u.id=p.user_id WHERE u.email=? AND p.code_hash=? AND p.expires_at>NOW() AND p.used_at IS NULL ORDER BY p.id DESC LIMIT 1`,[email,hash(code)]);if(!rows.length)return null;return rows[0];},
 async consumeReset(token){const [rows]=await pool.execute(`SELECT id,user_id FROM password_reset_tokens WHERE token_hash=? AND expires_at>NOW() AND used_at IS NULL LIMIT 1`,[hash(token)]);if(!rows.length)return null;await pool.execute(`UPDATE password_reset_tokens SET used_at=NOW() WHERE id=?`,[rows[0].id]);return rows[0];}
};module.exports=AuthToken;
