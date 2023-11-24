const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt');
const homeService = require('../services/homeService.js');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require("axios");

fs.readdir('./public/uploads', (error) => {
    if (error) {
        fs.mkdirSync('./public')
        fs.mkdirSync('./public/uploads');
        fs.mkdirSync('./public/uploads/img');
        fs.mkdirSync('./public/uploads/video');
    }
})
// let varUA = navigator.userAgent.toLowerCase(); //userAgent 값 얻기  
// if ( varUA.indexOf('android') > -1) {     
//     //안드로이드 
//     //.log('android')
// } else if ( varUA.indexOf("iphone") > -1 || varUA.indexOf("ipad") > -1 || varUA.indexOf("ipod") > -1 ) {     
//     //IOS 
//     //.log('IOS')
// } else {     
//     //아이폰, 안드로이드 외 모바일 
//     //.log('else')
// }

router.post('/join', async (req, res) => {
    const data = req.body;
    // //.log('data',data)
    try {
        const cryptedPW = bcrypt.hashSync(data.pw, 10);
        const result = await homeService.join(data, cryptedPW);
        if (result.affectedRows > 0) {
            res.send({ result: 0 })
        } else {
            res.send({ result: 1 })
        }
    } catch (err) {
        res.status(500).json({ result: -1, error: "Internal Server Error" });
    }
})

router.post('/logout', async (req, res) => {
    try {
        req.session.destroy();
        if (req.session == undefined) {
            res.json({ result: 1 })
        } else {
            res.json({ result: 0 })
        }
    } catch (err) {
        //.log(err)
    }
})

router.post('/emailCheck', async (req, res) => {
    try {
        const userEmail = req.body.email;
        const result = await homeService.duplicateCheck(userEmail);
        if (result.length > 0) {
            res.json({ result: 1 });
        } else {
            res.json({ result: 0 });
        }

    } catch (error) {
        //.error(error);
        res.status(500).json({ result: -1, error: "Internal Server Error" });
    }
});

router.post('/findPassword', async (req, res) => {

    try {
        let { email, newPw } = req.body
        userEmail = req.body.email
        const cryptedPW = bcrypt.hashSync(newPw, 10);
        const result = await homeService.updatePassword(userEmail, cryptedPW)
        if (result.affectedRows > 0) {
            res.json({ result: 1 });
        } else {
            res.json({ result: 0 });
        }
    } catch (error) {
        //.log(error);
    }
})

router.post('/passwordCheck', async (req, res) => {
    try {
        const userEmail = req.body.email;
        const result = await homeService.signInCheck(userEmail)
        if (result.length > 0) {
            const same = bcrypt.compareSync(req.body.pw, result[0].pw)
            if (same) {
                res.json({ result: 1 });
            }
        } else {
            res.json({ result: 0 });
        }
    } catch (error) {
        //.log(error);
    }
})

router.post('/modify', async (req, res) => {
    try {
        const userEmail = req.body.email;
        const nickname = req.body.nickname;
        const cryptedPW = bcrypt.hashSync(req.body.pw, 10);
        const result = await homeService.updatePassword(userEmail, cryptedPW);
        if (result.affectedRows > 0) {
            const nickResult = await homeService.updateNickname(userEmail, nickname);
            if (nickResult.affectedRows > 0) {
                res.json({ result: 1 });
            }
        } else {
            res.json({ result: 0 });
        }
    } catch (error) {
        //.log(error);
    }
});

const upLoadVideo = (req, res, next) => {
    try {
        uploadVideo.single('video')(req, res, (err) => {
            if (err) {
                // //.log(err);
                return res.status(500).json({ result: -1, error: "파일 업로드 오류" });
            }
            // //.log("File uploaded successfully");
            next();
        });
    } catch (err) {
        // //.log(err);
        res.status(500).json({ result: -1, error: "내부 서버 오류" });
    }
};

const uploadVideo = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join('public', 'uploads', 'video'));
        },
        filename: function (req, file, cb) {
            let time = new Date
            let setTime = `${time.getFullYear()}${time.getMonth() + 1}${time.getDate()}${time.getHours()}${time.getMinutes()}`
            const ext = path.extname(file.originalname)
            // cb(null, `${req.user.user_code}_${setTime}` + ext);
            cb(null, `${req.session.email}_${setTime}` + ext);
        }
    })
})

// flask 연동 테스트중 ... 
router.post('/sendTrainer', upLoadVideo, async (req, res) => {
    try {
        // const userCode = req.user.user_code;
        const trainer = await homeService.searchTrainer();
        const matchNum = Math.floor(Math.random() * trainer.length)
        // 임시로 넣은 변수(나중에 지워야함)
        // let userEmail = 'qwe@gmail.com'
        let accuracy = 0
        let accuracy_list = []
        let sum = 0
        let exercise_category = '런지'
        let user_comment = '자세교정 부탁드립니다.'
        let testUrl = '/public/uploads/video/user_email_time'
        for (let i = 0; i < 5; i++) {
            accuracy_list[i] = Math.floor(Math.random() * 100)
            sum += accuracy_list[i]
        }
        accuracy = sum / accuracy_list.length





        // flask 연동 부분
        // const url = JSON.stringify(req.file.path)
        const url = req.file.path
        const type = req.body.type
        // console.log('to flask', req.file.path)
        // console.log('to flask', url)
        const response = await axios.post('http://127.0.0.1:5000/test',{url, type}); 

        res.json({
            message: 'from flask',
            status: 'success',
            data: response.data.result,
        });









        // if (result.affectedRows > 0) {
        //     res.json({
        //         message: 'from flask',
        //         status: 'success',
        //         data: response.data.result,
        //     });
        // } else {
        //     res.json({
        //         message:'fail',
        //         status: 'fail'
        //     })
        // }

  


        // const result = await homeService.sendFeedback(req.user.email, trainer[matchNum].trainer_code, exercise_category, user_comment, accuracy, accuracy_list, testUrl);
        // if (result.affectedRows > 0) {
        //     res.json({ result: 1 })
        // } else {
        //     res.json({ result: 0 })
        // }

    } catch (err) {
        //.log(err)
    }
})

router.post('/logout', (req, res) => {
    try {
        req.session.destroy();
        if (req.session == undefined) {
            res.json({ result: 1 })
        } else {
            res.json({ result: 0 })
        }
    } catch (err) {
        //.log(err)
    }
})

router.post('/getFeedback', async (req, res) => {
    try {
        const result = await homeService.getFeedback(userEmail);
        if (result.length > 0) {
            res.json({ result: result })
        } else {
            res.json({ result: null })
        }
    } catch (err) {
        //.log(err)
    }
})

router.post('/getData', async (req, res) => {
    try {
        const result = await homeService.getConnectionData(userEmail);
        if (result.length > 0) {
            res.json({ list: result })
        } else {
            res.json({ list: 0 })
        }
    } catch (err) {
        //.log(err)
    }
})

router.post('/test', async (req, res) => {
    try {
        const trainer = await homeService.searchTrainer();
        const matchNum = Math.floor(Math.random() * trainer.length)
        // //.log('trainer : ', trainer)
        // //.log('matchNum : ', matchNum)
        let accuracy = 0
        let accuracy_list = []
        let sum = 0
        let exercise_category = '스쿼트'
        let user_comment = '골반 자세가 너무 안잡혀서 고민입니다.'
        let testUrl = '/public/uploads/video/user_email_time'
        let email = 'qwe@gmail.com'
        for (let i = 0; i < 5; i++) {
            accuracy_list[i] = Math.floor(Math.random() * 100)
            sum += accuracy_list[i]
        }
        accuracy = sum / accuracy_list.length
        const result = await homeService.sendFeedback(email, trainer[matchNum].trainer_code, exercise_category, user_comment, accuracy, accuracy_list, testUrl);
        // //.log('accuary', accuracy)
        // //.log('accuary_list', accuracy_list)
        // const result1 = await homeService.getFeedback(email);
        // //.log('result1', result1)
        // if (result1 == null) {
        //     //.log('asdf')
        // } else {
        //     //.log('zxcz')
        // }
    } catch (err) {
        //.log(err)
    }
})

// flask 연동 테스트중 ... 
// flask -> node : 전체점수, 횟수별 점수리스트, 쪼개진영상url(url_1, url_2, ...) 
// router.post('/dataToFlask',async(req,res)=>{
//     try{
//         let userEmail = 'qwe@gmail.com'
//         const videoDirectory = './public/uploads/video'
//         const files = fs.readdirSync(videoDirectory);
//         const videoContent = []
//         let i = 0
//         files.forEach(file=>{
//             if(file.startsWith(`${userEmail}_`)){
//                 videoContent[i] = path.join(videoDirectory,file)
//                 i += 1
//             }
//         })
//         const data = {
//             url : videoContent[videoContent.length - 1]
//         }
//         const response = await axios.post('http://localhost:5000/test',{data}); 
//         //.log('response data : ',response.data)
//         res.json({
//             message : 'from flask',
//             data : response.data
//         })
//     }catch(err){
//         //.log(err)
//     }
// })


module.exports = router;