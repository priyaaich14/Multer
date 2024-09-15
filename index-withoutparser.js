//single file
// const express = require('express')
// const cors = require('cors')
// const multer = require('multer')
// const csv = require('csvtojson')
// const mongoose = require('mongoose')
// const port = 3081

// const { Schema, model } = mongoose
// // Define Mongoose Schema for products
// const productSchema = new Schema({
//   name: { 
//     type: String, 
//     required: true 
// },
//   price: { 
//     type: Number, 
//     required: true
//  },
//   category: { 
//     type: String, 
//     required: true 
// },
//   stock: { 
//     type: Number, 
//     required: true 
// },
// })

// const Product = model('Product', productSchema)

// // Configure Multer for file uploads
// const upload = multer({ dest: 'uploads/' })

// const app = express()
// app.use(express.json())
// app.use(cors())
// // Connect to MongoDB
// mongoose.connect('mongodb://127.0.0.1:27017/product-withoutParser-db-24')
//   .then(() => console.log('Connected to DB'))
//   .catch((err) => console.error('Error connecting to DB:', err))

// // API endpoint for uploading CSV file
// app.post('/api/upload', upload.single('productData'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).send('No file uploaded')
//     }

//     const csvData = await csv().fromFile(req.file.path)

//     // Validate CSV data against product schema
//     const validatedData = csvData.filter((product) => {
//       return product.name && product.price && product.category && product.stock
//     })

//     if (validatedData.length !== csvData.length) {
//       return res.status(400).send('Invalid data in CSV file')
//     }

//     // Insert validated data into MongoDB
//     await Product.insertMany(validatedData)

//     //res.send('Product data imported successfully')
//     res.send({
//         message: 'Product data imported successfully',
//         data: validatedData,
//       })
//   } catch (err) {
//     console.error('Error importing product data:', err)
//     res.status(500).send('Internal server error')
//   }
// })

// app.listen(port, () => {
//     console.log('Server listening on port',port)
// })

// for multiple files
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const csv = require('csvtojson')
const mongoose = require('mongoose')

const port = 3081

const { Schema, model } = mongoose

// Define Mongoose Schema for products
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
},
})

const Product = model('Product', productSchema)

// Configure Multer for file uploads with a custom storage destination
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.originalname + uniqueSuffix);
  },
})

const upload = multer({ storage })

const app = express()
app.use(express.json())
app.use(cors())

// Connect to MongoDB
mongoose
  .connect('mongodb://127.0.0.1:27017/product-json-db-24')
  .then(() => console.log('Connected to DB'))
  .catch((err) => console.error('Error connecting to DB:', err))

// API endpoint for uploading multiple CSV files
app.post('/api/upload', upload.array('productData',10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send('No files uploaded')
    }

    const allProductData = []

    for (const file of req.files) {
      const csvData = await csv().fromFile(file.path)

      // Validate CSV data against product schema
      const validatedData = csvData.filter((product) => {
        return product.name && product.price && product.category && product.stock
      })

      if (validatedData.length !== csvData.length) {
        return res.status(400).send('Invalid data in some CSV files')
      }

      allProductData.push(...validatedData)
    }

    // Insert validated data into MongoDB
    await Product.insertMany(allProductData)

    //res.send('Product data imported successfully from all files')
    res.send({
                message: 'Product data imported successfully',
                data:allProductData ,
              })
  } catch (err) {
    console.error('Error importing product data:', err)
    res.status(500).send('Internal server error')
  }
})

app.listen(port, () => {
  console.log('Server listening on port', port)
})

