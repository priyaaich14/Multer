const express = require('express')
const cors = require('cors')
const multer = require('multer')
const csv = require('csv-parser')
const fs = require('fs')
const mongoose = require('mongoose')
const { validationResult } = require('express-validator')


const app = express()
const port = 3077

// Multer configuration for file upload
const upload = multer({ dest: 'uploads/' })

// Middleware
app.use(express.json())
app.use(cors())

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/product-multer-24')
    .then(() => console.log('Connected to DB'))
    .catch((err) => console.error('Error connecting to DB:', err))
const {Schema,model} = mongoose
// Product Schema
const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    }
})

const Product = model('Product', productSchema)

// API Endpoint to handle file upload
app.post('/api/upload', upload.single('csv'), async (req, res) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' })
        }
        console.log('File uploaded:', req.file.originalname)
        // Array to store products from CSV
        const products = []

        // Read CSV file
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => {
                // Validate CSV content and push to products array
                products.push(data)
            })
            .on('end', async () => {
                // Insert products into MongoDB
                await Product.insertMany(products)
                // Remove uploaded file
                fs.unlinkSync(req.file.path)
                // Send response
                res.json({ message: 'CSV file uploaded successfully', products })
            })
    } catch (error) {
        console.error('Error uploading CSV:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})
// Error handler middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something went wrong!' })
})
// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

//  API Endpoint to handle file upload for multiple files
//  app.post('/api/upload', upload.array('csv', 10), async (req, res) => {
//      try {
//          const files = req.files
//          if (!files || files.length === 0) {
//              return res.status(400).json({ error: 'No files uploaded' })
//          }
 
//          // Array to store all products from all CSV files
//          const allProducts = []
 
//          // Process each uploaded file
//          for (const file of files) {
//              // Array to store products from current CSV
//              const products = []
 
//              // Read CSV file
//              await new Promise((resolve, reject) => {
//                  fs.createReadStream(file.path)
//                      .pipe(csv())
//                      .on('data', (data) => {
//                          // Validate CSV content
//                          const product = {
//                              name: data.name,
//                              price: parseFloat(data.price),
//                              category: data.category,
//                              stock: parseInt(data.stock)
//                          }
//                          // Validate product fields
//                          const productErrors = validationResult(product)
//                          if (!productErrors.isEmpty()) {
//                              reject(new Error(`Validation error in file ${file.originalname}: ${productErrors.array().map(error => error.msg).join(', ')}`))
//                          }
//                          products.push(product)
//                      })
//                      .on('end', () => {
//                          // Push products from current CSV to allProducts array
//                          allProducts.push(...products)
//                          // Resolve the promise
//                          resolve()
//                      })
//                      .on('error', (error) => {
//                          // Reject the promise if an error occurs
//                          reject(error)
//                      })
//              })
 
//              // Remove processed file
//              fs.unlinkSync(file.path)
//          }
 
//          // Insert all products into MongoDB
//          await Product.insertMany(allProducts)
 
//          // Send response
//          res.json({ message: 'CSV files uploaded successfully', products: allProducts })
//      } catch (error) {
//          console.error('Error uploading CSV:', error)
//          res.status(500).json({ error: 'Internal Server Error' })
//      }
//  })
 
//  // Error handler middleware
//  app.use((err, req, res, next) => {
//      console.error(err.stack)
//      res.status(500).json({ error: 'Something went wrong!' })
//  })
 
//  // Start server
//  app.listen(port, () => {
//      console.log(`Server running on port ${port}`)
//  })
 
 /*Multer Middleware:
const upload = multer({ dest: 'uploads/' })
multer is a middleware for handling multipart/form-data, which is primarily used 
for uploading files.
In this code, it's initialized with { dest: 'uploads/' }, which specifies the 
destination directory for uploaded files.

upload.array('csv', 10)
upload.array() is a function that handles multiple file uploads with the same field name.
In this case, it specifies that the field name in the HTML form should be 'csv', 
and it accepts up to 10 files.
CSV Parser Middleware:

.pipe(csv())
csv-parser is a module used for parsing CSV files in Node.js.
Here, csv() is a function returned by the csv-parser module, which is used as a
 stream transformer.
It's used with the .pipe() method to parse the data stream from the CSV file.
Properties and Functions:
req.files: This property is provided by multer and contains information about the uploaded files. It's an array of file objects.
fs.createReadStream(file.path): This function creates a readable stream from the 
uploaded file's path.
.pipe(csv()): This function pipes the readable stream of the CSV file to the csv-parser 
for parsing.
.on('data', callback): This function listens for data events emitted by the stream
 and executes the callback function for each row of data in the CSV file.
.on('end', callback): This function listens for the end event emitted by 
the stream and executes the callback function when the stream ends.
.on('error', callback): This function listens for any error events emitted
 by the stream and executes the callback function if an error occurs.
fs.unlinkSync(file.path): This function synchronously removes the uploaded file after processing.*/
 
