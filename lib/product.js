/**
 * Created by waldy on 28/1/19.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test1', { useNewUrlParser: true });
// var ObjectId = Schema.ObjectId;

var productSchema = new mongoose.Schema({
  creator_id: String,
  product_name: String,
  property1: String,
  property2: String,
  status: String
});

var Product = mongoose.model('product', productSchema);
module.exports = Product;
