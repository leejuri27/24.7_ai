const express = require('express')
const router = express.Router()
const axios = require("axios");
const multer = require('multer');
const bcrypt = require('bcrypt');
const passport = require('../passport/passport');

router.get('/',(req,res)=>{
    res.render('index')
})

module.exports = router;