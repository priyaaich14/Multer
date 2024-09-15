const mongoose = require('mongoose')

const { Schema, model } = mongoose

const productSchema = new Schema({
    name: String,
    price: Number,
    category: String,
    stock: Number,
  })
  
  const Product = model('Product', productSchema)

  module.exports = Product