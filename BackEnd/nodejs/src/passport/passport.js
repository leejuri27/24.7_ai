const passport = require('passport');
const local = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const conn = require('../../config/database');
const userQueries = require('../queries/userQueries')
const trainerQueries = require('../queries/trainerQueries')

let userData = ""
let userType = ''

//로그인 성공 0 아니면 1
passport.use('local-login', new local({
    usernameField: 'email',
    passwordField: 'pw',
    session: true,
    passReqToCallback: true
}, async (req, email, pw, done) => {
    try {
        const type = req.body.type;
        let [userRows] = []
        if (userType == 'u') {

            [userRows] = await conn.query(userQueries.signInCheck, [email], (err, rows) => { })

        } else if (userType == 't') {
            [userRows] = await conn.query(trainerQueries.signIn, [email], (err, rows) => { })
        }
        const user = userRows[0]
        const same = bcrypt.compareSync(pw, user.pw)
        if (same) {
            return done(null, user)
        }
        return done(null, false, { message: 'login failed' })
    } catch (err) {
        console.log(err)
        return done(err)
    }
}))

passport.serializeUser(function (user, done) {
    console.log('serializeUser() 호출');
    console.log(user.email);
    done(null, user.email)
})


/** DB에 연동해서 결과를 얻어내는 함수 */
const getUserData = async (user) => {
    if(userType == 'u'){

        const [result] = await conn.query(userQueries.duplicateCheck, [user]);
        
        if (result.length > 0) {
            userData = { email: result[0].email, user_code: result[0].user_code };
        } else {
            userData = undefined;
        }
        return userData;

    }else{
        const [result] = await conn.query(trainerQueries.duplicateCheck, [user]);
        
        if (result.length > 0) {
            userData = { email: result[0].email, trainer_code: result[0].trainer_code };
        } else {
            userData = undefined;
        }
        return userData;
    }
}


passport.deserializeUser(async (user, done) => {
    try {
        const userData = await getUserData(user);
        done(null, userData);
    } catch (err) {
        done(err)
    }

})
module.exports = passport