const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const nunjucks = require('nunjucks');
const axios = require("axios");
const cors = require("cors");
const session = require('express-session');
const fileStore = require('session-file-store')(session);

const indexRouter = require('./src/routes/index');
const userRouter = require('./src/routes/user');
const trainerRouter = require('./src/routes/trainer');
const authRouter = require('./src/routes/auth');
const uploadRouter = require('./src/routes/upload')


const passport = require('passport');
const passportConfig = require('./src/passport/passport')
const flash = require('connect-flash');


app.set('view engine','html');
nunjucks.configure('views',{
    express : app,
    watch : true
});

app.use(cors());
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname+'/public'));

app.use(session({
  httpOnly : true,
  resave : false,
  secret : 'secret',
  store : new fileStore(),
  saveUninitialized: false,
  expires: new Date(Date.now() + (60 * 60 * 24 * 7 * 1000)),
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/',indexRouter);
app.use('/user',userRouter);
app.use('/trainer',trainerRouter);
app.use('/auth',authRouter);
app.use('/upload',uploadRouter)

app.listen(3000, () => {
  console.log("Node.js server is running on port 3000");
});