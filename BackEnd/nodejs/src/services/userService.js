const conn = require('../../config/database')
const userQueries = require('../queries/userQueries')
const bcrypt = require('bcrypt')

const userService = {

    /** 회원가입 */
    join: async (data, cryptedPW) => {
        try {
            const [results] = await conn.query(userQueries.signUp, [data.email, cryptedPW, data.nick]);
            return results
        } catch (err) {
            console.log(err);
            throw err;
        }
    },

    /** 이메일 체크 */
    duplicateCheck: async (userEmail) => {
        try {
            const [results] = await conn.query(userQueries.duplicateCheck, userEmail);
            return results
        } catch (err) {
            throw err;
        }
    },

    /** 비밀번호 변경 */
    updatePassword: async (userEmail, cryptedPW) => {
        try {
            const [results] = await conn.query(userQueries.updatePassword, [cryptedPW, userEmail]);
            return results;
        } catch (err) {
            throw err;
        }
    },

    /** 로그인 */
    signInCheck: async (userEmail) => {
        try {
            const [results] = await conn.query(userQueries.signInCheck, [userEmail]);
            return results;
        } catch (err) {
            throw err;
        }
    },

    /** 닉네임 변경 */
    updateNickname: async (userEmail, nickname, cryptedPw) => {
        try {
            const [updateResult] = await conn.query(userQueries.updatePassword, [cryptedPw, userEmail]);
            if (updateResult.affectedRows > 0) {
                const [results] = await conn.query(userQueries.updateNickname, [nickname, userEmail]);
                return results;
            }
        } catch (err) {
            throw err;
        }
    },

    /** 영상을 보내기위한 트레이너 검색 */
    searchTrainer: async () => {
        try {
            const [results] = await conn.query(userQueries.searchTrainer);
            if (results.length > 0) {
                return results;
            }
        } catch (err) {
            throw err;
        }
    },

    /** DB에 AI로 분석하지 않는 영상 저장 */
    setFeedback: async (userCode, trainerCode, comment, exerciseCategory) => {
        try {
            const [result] = await conn.query(userQueries.setFeedback, [userCode, trainerCode, exerciseCategory, comment]);
            const [getConnectionCode] = await conn.query(userQueries.getFeedbackDate, [userCode]);
            if(getConnectionCode.length > 0){
                return getConnectionCode
            }
        } catch (err) {
            throw err;
        }
    },

    /** connection별 주소 저장 */
    setVideoUrl:async(videoUrl,connectionCode)=>{
        try{
            const [result] = await conn.query(userQueries.setVideoUrl,[videoUrl,connectionCode]);
            if(result.affectedRows > 0){
                return result
            }
        }catch(err){
            throw err;
        }
    },

    /** DB에 피드백 저장 */
    sendFeedback: async (accuracy, accuracyList, connectionCode) => {
        try {
            const [results] = await conn.query(userQueries.sendFeedback, [accuracy, accuracyList, connectionCode]);
            if(results.affectedRows > 0){
                return results
            }
        } catch (err) {
            throw err;
        }
    },

    /** DB에 저장된 운동 데이터를 가져오기 */
    getConnectionData: async (userCode) => {
        try {
            const [connectionResult] = await conn.query(userQueries.getFeedbackDate, [userCode]);
            if(connectionResult.length > 0){
                return connectionResult
            }
        } catch (err) {
            throw err;
        }
    },

    /** 특정 날짜 데이터 가져오기 */
    getFeedback: async (connectionCode) => {
        try {
            const [result] = await conn.query(userQueries.getFeedback, [connectionCode]);
            if (result.length > 0) {
                return result;
            } else {
                return result;
            }
        } catch (err) {
            throw err;
        }
    },

    /** 해당 트레이너 정보 가져오기 */
    getTrainerInfo: async (connectionCode) => {
        try {
            const [result] = await conn.query(userQueries.searchTrainerCode, [connectionCode])
            if (result.length > 0) {
                const [trainerInfo] = await conn.query(userQueries.getTrainerInfo, [result[0]])
                if (trainerInfo.length > 0) {
                    return trainerInfo;
                }
            }
        } catch (err) {
            throw err;
        }
    },

    /** connection_code에 맞는 분석 결과 가져오기 */
    getDataFeedback: async (connectionCode) => {
        try {
            const [result] = await conn.query(userQueries.getDataFeedback, [connectionCode])
            if (result.length > 0) {
                return result
            }
        } catch (err) {
            throw err;
        }
    },

    /** 트레이너 피드백 알림 용 */
    alarmFeedback: async (userCode) => {
        try {
            const [result] = await conn.query(userQueries.getAlarm, [userCode]);
            if (result.length > 0) {
                return result
            }
        } catch (err) {
            throw err
        }
    },

    /** 운동 참고 영상 가져오기 */
    getReference: async (exerciseCategory) => {
        try {
            const [result] = await conn.query(userQueries.getReference, [exerciseCategory]);
            if (result.length > 0) {
                return result
            }
        } catch (err) {
            throw err
        }
    },

    /** 저장된 메모 가져오기 */
    getMemo: async (connectionCode) => {
        try {
            const [result] = await conn.query(userQueries.getMemo, [connectionCode]);
            if (result.length > 0) {
                return result
            }
        } catch (err) {
            throw err
        }
    },

    /** 운동 별 메모 저장 */
    updateMemo: async (connectionCode, memo) => {
        try {
            const [result] = await conn.query(userQueries.saveMemo, [memo, connectionCode]);
            if (result.affectedRows > 0) {
                return result
            }
        } catch (err) {
            throw err
        }
    }

}

module.exports = userService;