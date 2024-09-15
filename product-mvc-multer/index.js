const express = require('express')
const cors = require('cors')
const port = 3070
const app = express()
const multer = require('multer')
const configureDB = require('./config/db')
const productCltr = require('./app/controller/product.cltr')

app.use(express.json())
app.use(cors())

configureDB()


const upload = multer({dest: 'uploads/'})

app.post('/upload', upload.single('file'), productCltr.create)
app.get('/list', productCltr.list)

app.listen(port, () => {
    console.log('Server is running on port ', port)
})