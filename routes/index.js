var express = require('express');
var router = express.Router();
let db = require("../config/db") 
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
     step:1
  });
});


router.post('/gen_info', function(req, res, next) {

    db.query("show tables", [], function (err, rows) {
        results = rows;
        console.log("results: " + results.str);
        res.send(results);
    });

  // res.render('index', {
  //   postData:{...req.body},
  //   sqlData:{},
  //   step:2
  // });
});


module.exports = router;
