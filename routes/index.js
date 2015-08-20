var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  var user = req.session.user;
  if (!user)
    res.redirect('/login');
  res.render('index', {title: 'Nodejs-Redis-Socket.io', user: user});
});

router.get('/login', function (req, res, next) {
  res.render('login', {title: 'Logn'});
});

router.post('/user', function (req, res) {
  console.log(req.body.user);
  req.session.user = req.body.user;
  res.redirect('/');
});

router.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
