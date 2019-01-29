var express = require('express');
var router = express.Router();
var assert = require('assert');

// var MongoClient = require('mongodb').MongoClient;
// var objectId = require('mongodb').ObjectID;

var User = require('../lib/user');
var Product = require('../lib/product');


// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Form Validation', success: false, errors: req.session.errors });
// });

/**
 * This api is used to register the user.
 * Admin have to register directly an not through this api.
 */
router.post("/register", function(req, res) {
  var username = req.body.username;
  // The password can be hashed and encrypted but to keep it simple here hashing is not implemented
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
    return res.status(200).json("Successfully Registered").send();
  });
});

/**
 * Login api.
 */
router.post("/login", function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  // Currently we are using the express session
  // We can take a more advance approach by using jwt-token which provides advance options to
  // store sessions and auto time out facilities
  User.findOne({username: username, password: password}, function (err, user) {
    if (err) {
      console.log(err);
      return res.status(500).json(err).send("Access Denied");
    }
    if (!user) {
      return res.status(200).json("No user found").send();
    }
    if (user) {
      console.log(user);
      req.session.user = user;
      return res.status(200).json("Logged in successfully").send();
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

/**
 * Delete api
 * Admin can delete any of the products.
 *
 */
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

/**
 * This api can be accessed by admin only
 * He/She can change the status of the code published/unpublished.
 */
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

/**
 * This api can be accessed by all the uses (Anomyous users)
 * This will display all the published content
 */
router.get('/retrieve-products', function (req, res) {
  Product.find({status: 'Published'}).then(function (doc) {
    return res.status(200).json(doc).send();
  });
});

/**
 * Logout Api
 */
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
