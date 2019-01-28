var express = require('express');
var router = express.Router();
var assert = require('assert');

var MongoClient = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017';

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

  MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
    assert.equal(null, err);
    var db = client.db('test1');
    db.collection('user-data').insertOne(item, function(err, result) {
      assert.equal(null, err);
      console.log("Item Inserted");
      client.close();
      res.json({message: 'success'});
    });
  })
});

router.post('/retrieve', function (req, res, next) {

  var resultArray = [];
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client)  {
    assert.equal(null, err);
    var db = client.db('test1');
    var cursor = db.collection('user-data').find();
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      resultArray.push(doc);
    }, function() {
      client.close();
      res.json({output: resultArray});
    });
  });

});

router.post('/update', function (req, res, next) {
  var item = {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  };

  var id = req.body.id;

  MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
    assert.equal(null, err);
    var db = client.db('test1');
    db.collection('user-data').updateOne({"_id": objectId(id)}, {$set: item}, function(err, result) {
      assert.equal(null, err);
      console.log("Item Updated");
      client.close();
      res.json({message: 'success'});
    });
  })
});


router.post('/delete', function (req, res, next) {
  var id = req.body.id;

  MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
    assert.equal(null, err);
    var db = client.db('test1');
    db.collection('user-data').deleteOne({"_id": objectId(id)}, function(err, result) {
      assert.equal(null, err);
      console.log("Item Deleted");
      client.close();
      res.json({message: 'success'});
    });
  })
});

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
