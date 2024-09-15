const mongoose = require('mongoose')

const configureDB = () => {
    mongoose.connect('mongodb://127.0.0.1:27017/product-data')
    .then((db) => {
        console.log('Connected to Database')
    })
    .catch((err) => {
        console.log('Error connecting to the Database', err)
    })
}

module.exports = configureDB