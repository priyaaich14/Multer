const Product = require('../model/product-model')
const csvParser = require('csv-parser')

const fs = require('fs')

const productCltr = {}

productCltr.create = (req, res) => {
  if(!req.file) {
    return res.status(400).send('No file uploaded!!!')
  }
  if(req.file.mimetype !== 'text/csv') {
    return res.status(400).send('Invalid file format, please upload a CSV file!!!')
  }

  const results = []
  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on('data', (data) => {
      results.push(data)
    })

    .on('end', () => {
      Product.insertMany(results)
      .then(() => {
        res.status(200).send('File uploaded successfully!!!')
    })
    .catch((err) => {
        res.status(400).send('Error in inserting data into the Database',err)
    }) 
    })

  .on('error', (err) => {
    res.status(400).send('Error in parsing the csv file!!!',err)
  })
}
productCltr.list = (req, res) => {
    Product.find()
        .then((products) => {
            res.json(products)
        })
        .catch((err) => {
            res.status(500).json({error : 'Something went wrong'})
        })
}

module.exports = productCltr