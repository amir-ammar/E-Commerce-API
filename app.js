require('dotenv').config()
require('express-async-errors')

const express = require('express')
const app = express()

const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')


// Swagger
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDoc = YAML.load('./swagger.yaml')


// db
const connectDB = require('./db/connect')

// routes

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const orderRoutes = require('./routes/orderRoutes')

// middleswares
const errorHandlerMiddleware = require('./middleware/error-handler')
const notFound = require('./middleware/not-found')


app.use(morgan('tiny'))
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))
app.use(express.static('./public'))
app.use(fileUpload())
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(rateLimiter({ windowMs: 60 * 1000, max: 60 }))


app.get('/', (req, res) => {
    res.send('<h1> E-Commerce API </h1><a href="/api-docs">Documention</a>')
})

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc))

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/reviews', reviewRoutes)
app.use('/api/v1/orders', orderRoutes)



app.use(notFound)
app.use(errorHandlerMiddleware)


const port = process.env.PORT || 5000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL)
        app.listen(port , () => console.log(`Server is listening on port ${port}`))    
    } catch (error) {
        console.error(error);
    }
    
}

start()
