module.exports = {

    signUp : `insert into trainer (email, pw, trainer_name, profile_pic, career) values (?,?,?,?,?)`,

    signIn : `select * from trainer where email = ?`,

    duplicateCheck : `select * from trainer where email = ?`,

    getMemberInfo : `select * from user where user_code = ?`,

    getMemberList : `select connection.connection_code, connection.trainer_code, connection.user_code, user.nickname, max(connection.connection_date) as latest, max(connection.confirm_trainer) as checked from connection join user on connection.user_code = user.user_code where trainer_code = ? group by connection.user_code order by latest desc`,

    getHistory : `select * from connection where trainer_code = ? and user_code = ?`,

    getDetail : `select * from connection where connection_code = ?`
}