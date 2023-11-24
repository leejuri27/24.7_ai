const express = require('express');
const router = express.Router();
const passport = require('../passport/passport');

router.post(
  '/login',
  passport.authenticate('local-login', {
    failWithError: true,
  }),
  function (req, res, next) {
    console.log(req.user);
    res.json({ result: 0 });
  },
  function (req, res, next) {
    res.json({ result: 1 });
  }
);

module.exports = router;
