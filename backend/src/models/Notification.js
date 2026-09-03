const pool=require('../config/database');
const Notification={
 async findByUser(userId){const [rows]=await pool.execute(`SELECT n.id,n.user_id,n.title,n.message,n.category,n.is_read,n.created_at,nl.entity_type,nl.entity_id,nl.target_path FROM notifications n LEFT JOIN notification_links nl ON nl.notification_id=n.id WHERE n.user_id=? ORDER BY n.created_at DESC,n.id DESC`,[userId]);return rows;},
 async create({userId,title,message,category='General',entityType=null,entityId=null,targetPath=null}){const [r]=await pool.execute(`INSERT INTO notifications (user_id,title,message,category) VALUES (?,?,?,?)`,[userId,title,message,category]);if(targetPath||entityType){await pool.execute(`INSERT INTO notification_links (notification_id,entity_type,entity_id,target_path) VALUES (?,?,?,?)`,[r.insertId,entityType||'content',entityId?Number(entityId):0,targetPath]);}return r.insertId;},
 async markRead(id,userId){const [r]=await pool.execute(`UPDATE notifications SET is_read=TRUE WHERE id=? AND user_id=?`,[id,userId]);return r.affectedRows>0;},
 async markAllRead(userId){const [r]=await pool.execute(`UPDATE notifications SET is_read=TRUE WHERE user_id=? AND is_read=FALSE`,[userId]);return r.affectedRows;},
 async delete(id,userId){const [r]=await pool.execute(`DELETE FROM notifications WHERE id=? AND user_id=?`,[id,userId]);return r.affectedRows>0;}
};module.exports=Notification;
