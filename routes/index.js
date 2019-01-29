var express = require('express');
var router = express.Router();
var assert = require('assert');

// var MongoClient = require('mongodb').MongoClient;
// var objectId = require('mongodb').ObjectID;

var User = require('../lib/user');
var Product = require('../lib/product');

// var url = 'mongodb://localhost:27017';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Form Validation', success: false, errors: req.session.errors });
});

// router.post('/insert', function(req, res, next) {
//   var item = {
//     title: req.body.title,
//     content: req.body.content,
//     author: req.body.author
//   };
//
//   MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
//     assert.equal(null, err);
//     var db = client.db('test1');
//     db.collection('user-data').insertOne(item, function(err, result) {
//       assert.equal(null, err);
//       console.log("Item Inserted");
//       client.close();
//       res.json({message: 'success'});
//     });
//   })
// });
//
// router.post('/retrieve', function (req, res, next) {
//
//   var resultArray = [];
//   MongoClient.connect(url, { useNewUrlParser: true }, function (err, client)  {
//     assert.equal(null, err);
//     var db = client.db('test1');
//     var cursor = db.collection('user-data').find();
//     cursor.forEach(function(doc, err) {
//       assert.equal(null, err);
//       resultArray.push(doc);
//     }, function() {
//       client.close();
//       res.json({output: resultArray});
//     });
//   });
//
// });
//
// router.post('/update', function (req, res, next) {
//   var item = {
//     title: req.body.title,
//     content: req.body.content,
//     author: req.body.author
//   };
//
//   var id = req.body.id;
//
//   MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
//     assert.equal(null, err);
//     var db = client.db('test1');
//     db.collection('user-data').updateOne({"_id": objectId(id)}, {$set: item}, function(err, result) {
//       assert.equal(null, err);
//       console.log("Item Updated");
//       client.close();
//       res.json({message: 'success'});
//     });
//   })
// });
//
//
// router.post('/delete', function (req, res, next) {
//   var id = req.body.id;
//
//   MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
//     assert.equal(null, err);
//     var db = client.db('test1');
//     db.collection('user-data').deleteOne({"_id": objectId(id)}, function(err, result) {
//       assert.equal(null, err);
//       console.log("Item Deleted");
//       client.close();
//       res.json({message: 'success'});
//     });
//   })
// });

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


router.post("/register", function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var role = 'user';

  var newuser = new User();
  newuser.username = username;
  newuser.password = password;
  newuser.firstname = firstname;
  newuser.lastname = lastname;
  newuser.role = role;
  newuser.session = null;

  newuser.save(function(err, savedUser) {
    if (err) {
      console.log(err);
      return res.status(500).send();
    }
    console.log(savedUser);
    return res.status(200).send();

  });
});

router.post("/login", function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username, password: password}, function (err, user) {
    if (err) {
      console.log(err);
      res.status(500);
      res.json(err);
      return res.send();
    }
    if (!user) {
      res.status(200);
      res.json("No user found");
      return res.send();
    }
    if (user) {
      console.log(user);
      req.session.user = user;

      res.status(200);
      res.json("user found");
      return res.send();
    }
  });
});

/**\
 * This api is used to create the product.
 * Admin and other registered users can create the products.
 */
router.post("/product-create", function(req, res) {
  if (!req.session.user) {
    return res.status(403).send("Access Denied");
  }
  else {
    user = req.session.user;

    // Getting all the parameters from the request

    var newProduct = new Product();

    newProduct.creator_id= user._id;
    newProduct.product_name= req.body.product_name;
    newProduct.property1= req.body.property1;
    newProduct.property2= req.body.property2;
    newProduct.status= 'Unpublish';

    newProduct.save(function(err, savedUser) {
      if (err) {
        console.log(err);
        return res.status(500).send();
      }
      else {
        res.status(200);
        res.json("Success Fully Saved");
        res.send();
        return res;
      }
    });
  }
});

/**
 * This api will be used to update the existing information.
 * Admin can update 
 */
router.post("/product-update", function(req, res) {
  if (!req.session.user) {
    return res.status(403).send("Access Denied");
  }
  else {
    user = req.session.user;
    id = req.body.id;
    Product.findById(id, function (err, prod) {
      if (err) {
        // console.error('error', 'No entry found');
        return res.status(401).json('No entry found').send();
      }
      else {
        creator_id = prod.creator_id;
        currentUserId = user._id;

        if (user.role == 'admin' || creator_id == currentUserId) {
          prod.name = req.body.name;
          prod.property1 = req.body.property1;
          prod.property2 = req.body.property2;
          prod.save();
          return res.status(200).json('Deleted Product').send();
        }
        else {
          return res.status(403).json('Access Denied').send();
        }
      }
    });
  }
});

router.post("/product-delete", function(req, res) {
  if (!req.session.user) {
    return res.status(403).send("Access Denied");
  }
  else {
    user = req.session.user;
    id = req.body.id;
    Product.findById(id, function (err, prod) {
      if (err) {
        console.error('err', 'No entry found');
        return res.status(401).json('Invalid Id').send();
      }
      else {
        creator_id = prod.creator_id;
        if (user.role == 'admin' || creator_id == user._id){
          Product.findByIdAndRemove(id).exec();
          return res.status(200).json('Deleted Product').send();
        }
        else {
          return res.status(403).json('Access Denied').send();
        }
      }
    });
  }
});

router.post('/product-publish', function(req, res) {
  if (!req.session.user) {
    return res.status(403).send("Access Denied");
  }
  else {
    Product.findById(id, function (err, prod){
      if (err) {
        console.error('err', 'No entry found');
        return res.status(200).json('Invalid Id').send();
      }
      else {
        if (user.role == 'admin') {
          prod.status = req.body.status;
          prod.save();
          return res.status(200).json('Status Successfully Updated').send();
        }
        return res.status(403).send("Access Denied");
      }
    });

  }
});


router.get('/retrieve-products', function (req, res) {
  Product.find({status: 'Published'}).then(function (doc) {
    return res.status(200).json(doc).send();
  });
});

router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return res.status(500).json().send();
      } else {
        return res.status(200).json("Successfully logged out").send();
      }
    });
  }
});

module.exports = router;
