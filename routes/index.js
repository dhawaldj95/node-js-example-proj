var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var assert = require('assert');

var url = 'mongodb://localhost:27017/test';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Form Validation', success: false, errors: req.session.errors });
});

router.post('/insert', function(req, res, next) {
  var item = {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  };

  mongodb.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection('user-data').insertOne(item, function(err, result) {
      assert.equal(null, error);
      console.log("Item Inserted");
      db.close();
      res.json({message: 'success'});
    });
  })
});

router.post('/retrieve', function (req, res, next) {

  var resultArray = [];
  mongodb.connect(url, function (err, db)  {
    assert.equal(null, err);
    var cursor = db.collection('user-data').find();
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      resultArray.push(doc);
    }, function() {
      db.close();
      res.json({output: resultArray});
    });
  });

})






// router.post('/submit', function(req, res, next) {
//   req.check('email', 'Invalid Email Address').isEmail();
//   req.check('password', 'Password is invalid').isLength({min:4});
//
//   var errors = req.validationErrors();
//   if (errors) {
//     req.session.errors = errors;
//     var array = [];
//     req.session.errors.forEach(function (element) {
//         console.log(element.msg);
//         array.push(element.msg);
//     });
//
//     res.json({ message: array });
//   }
//   else {
//     res.json({message: 'success'});
//   }
// });

module.exports = router;
