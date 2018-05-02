var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('wheel_game', { title: 'Express' });
});

module.exports = router;
