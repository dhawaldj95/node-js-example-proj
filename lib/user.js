/**
 * Created by waldy on 28/1/19.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test1', { useNewUrlParser: true });

// var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
  username: {type: String, unique: true},
  password: {type: String},
  firstname: String,
  lastname: String,
  role: String
});

var User = mongoose.model('myuser', userSchema);
module.exports = User;