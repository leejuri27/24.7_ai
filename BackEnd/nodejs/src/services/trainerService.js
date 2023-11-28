const conn = require('../../config/database')
const trainerQueries = require('../queries/trainerQueries')

const trainerService = {

    /** 회원가입 */
    join: async (data, cryptedPW, profilePic) => { 
        try {
            const [results] = await conn.query(trainerQueries.signUp, [data.email, cryptedPW, data.name, profilePic, data.career]);
            return results
        }
        catch (err) {
            throw err;
        }
    },

    /** 이메일 중복체크 */
    duplicateCheck: async (trainerEmail) => {
        try {
            const [results] = await conn.query(trainerQueries.duplicateCheck, [trainerEmail])
            return results
        } catch (err) {
            throw err;
        }
    },

    /** 로그인 */
    signIn: async (trainerEmail) => {
        try {
            const [results] = await conn.query(trainerQueries.signIn, [trainerEmail]);
            return results;
        } catch(err) {
            throw err;
        }
    },

    /** 회원 리스트 불러오기 */
    getMemberList: async (trainerCode) => {
        try {
            const [results] = await conn.query(trainerQueries.getMemberList, [trainerCode]);
            return results;
        } catch (err) {
            throw err;
        }
    },

    /** 회원 이력 불러오기 */
    getHistory: async (trainerCode, userCode) => {
        try {
            const [results] = await conn.query(trainerQueries.getHistory, [trainerCode, userCode]);
            return results;
        } catch (err) {
            throw err;
        }
    }, 

    /** 회원 정보 불러오기 */
    getMemberInfo: async (userCode) => {
        try {
            const [results] = await conn.query(trainerQueries.getMemberInfo, [userCode]);
            return results;
        } catch (err) {
            throw err;
        }
    },

    /** 회원 요청사항 불러오기 */
    getDetail: async (connectionCode) => {
        try {
            const [results] = await conn.query(trainerQueries.getDetail, [connectionCode]);
            return results;
        } catch (err) {
            throw err;
        }
    },

    /** 피드백 전송 */
    sendFeedback : async (connection_code, feedbackContent, link, base) => {
        try {
            const [results] = await conn.query(trainerQueries.sendFeedback, [connection_code, feedbackContent, link, base]);
            if (results.affectedRows > 0) {
                const [result] = await conn.query(trainerQueries.updateConfirm, [connection_code])
                return result;
            }
        } catch (err) {
            throw err;
        }
    }
}

module.exports = trainerService;