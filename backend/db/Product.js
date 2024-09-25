const mongoose = require('mongoose');

//make schema

const productSchema = new mongoose.Schema({
  name:String,
  price:String,
  category:String,
  userID:String,
  company:String
});

module.exports = mongoose.model('products' , productSchema)