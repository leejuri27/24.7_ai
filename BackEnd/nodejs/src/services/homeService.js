const conn = require('../../config/database')
const userQueries = require('../queries/userQueries')
const bcrypt = require('bcrypt')

const homeService = {

    join: async (data, cryptedPW) => {
        try {
            const [results] = await conn.query(userQueries.signUp, [data.email, cryptedPW, data.nick]);
            return results
        } catch (err) {
            console.log(err);
            throw err;
        }
    },

    duplicateCheck: async (userEmail) => {
        try {
            const [results] = await conn.query(userQueries.duplicateCheck, userEmail);
            return results
        } catch (err) {
            throw err;
        }
    },

    updatePassword: async (userEmail, cryptedPW) => {
        try {
            const [results] = await conn.query(userQueries.updatePassword, [cryptedPW, userEmail]);
            return results;
        } catch (err) {
            throw err;
        }
    },

    signInCheck: async (userEmail) => {
        try {
            const [results] = await conn.query(userQueries.signInCheck, [userEmail]);
            return results;
        } catch (err) {
            throw err;
        }
    },

    updateNickname: async (userEmail, nickname) => {
        try {
            const [results] = await conn.query(userQueries.updateNickname, [nickname, userEmail]);
            return results;
        } catch (err) {
            throw err;
        }
    },

    searchTrainer: async () => {
        try {
            const [results] = await conn.query(userQueries.searchTrainer);
            return results;
        } catch (err) {
            throw err;
        }
    },

    sendFeedback: async (userEmail, trainerCode, exerciseCategory, userComment, accuracy, accuracyList, userVideoUrl) => {
        try {
            const [userResult] = await conn.query(userQueries.duplicateCheck, [userEmail]);
            const userCode = userResult[0].user_code
            const accuracy_list = JSON.stringify(accuracyList);
            const [results] = await conn.query(userQueries.sendFeedback, [userCode, trainerCode, exerciseCategory, userComment, accuracy, accuracy_list, userVideoUrl]);
            //let data2 = JSON.parse(data); json 파싱하는법
            return results
        } catch (err) {
            throw err;
        }
    },

    getConnectionData: async (userEmail) => {
        try {
            const [userResult] = await conn.query(userQueries.duplicateCheck, [userEmail]);
            const userCode = userResult[0].user_code
            const [connectionResult] = await conn.query(userQueries.getFeedbackDate, [userCode]);
            return connectionResult
        } catch (err) {
            throw err;
        }
    },

    getFeedback: async (userEmail) => {
        try {
            const [userResult] = await conn.query(userQueries.duplicateCheck, [userEmail]);
            const userCode = userResult[0].user_code
            const [connectionResult] = await conn.query(userQueries.getFeedbackDate, [userCode]);
            if (connectionResult.length > 0) {
                for (let i = 0; i < connectionResult.length; i++) {
                    const [result] = await conn.query(userQueries.getFeedback, [connectionResult[i].connection_code]);
                    if (result.length > 0) {
                        return result;
                    } else {
                        return result;
                    }
                }
            }
            return connectionResult;
        } catch (err) {
            throw err;
        }
    }

}

module.exports = homeService;