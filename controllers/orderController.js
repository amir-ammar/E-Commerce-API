
const Order = require('../models/Order')
const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { checkPermission } = require('../utils')

const fakeStripeAPI = async ({ amount , currency }) => {
    const clientSecret = 'randomValue'
    return { clientSecret, amount }
}


const createOrder = async (req, res) => {
    const { items:cartItems, tax, shippingFee } = req.body

    if (!cartItems || cartItems.length < 1) throw new CustomError.BadRequestError('No cart items provided')
    
    if (!tax || !shippingFee) throw new CustomError.BadRequestError('Please provide tax and shipping fee')

    let orderItems = []
    let subtotal = 0


    for (const item of cartItems) {
        const dbProduct = await Product.findOne({ _id: item.product })
        if (!dbProduct) throw new CustomError.NotFoundError(`No product with id: ${item.product}`)
        const { name, price, image, _id } = dbProduct
        
        
        const singleOrderItem = {
            amount: item.amount,
            name,
            price,
            image, 
            product: _id
        }
        
        orderItems.push(singleOrderItem)
        subtotal += item.amount * price
    }   
    console.log(orderItems);
    const total = subtotal + shippingFee + tax
    
    const paymentIntent = await fakeStripeAPI({
        amount: total,
        currency: 'usd' 
    })

    const order = await Order.create({
        orderItems,
        total,
        subtotal,
        tax,
        shippingFee,
        clientSecret: paymentIntent.clientSecret,
        user: req.user.userId
    })

    res.status(StatusCodes.CREATED).json({ order, clientSecret: order.clientSecret }) 
}


const getAllOrders = async (req, res) => {
    const orders = await Order.find({})
    res.status(StatusCodes.OK).json({ orders, count: orders.length }) 
}

const getSingleOrder = async (req, res) => {
    const { id: orderId } = req.params
    const order = await Order.findOne({ _id: orderId })
    if (!order) throw new CustomError.NotFoundError(`No order with id ${orderId}`)
    checkPermission(req.user, order.user);
    res.status(StatusCodes.OK).json({ order })
}


const getCurrentUserOrders = async (req, res) => {
    const { userId } = req.user
    const orders = await Order.find({ user: userId })
    if (!orders) throw new CustomError.NotFoundError(`The current user has not orders`)
    res.status(StatusCodes.OK).json({ orders, count: orders.length })
}



const updateOrder = async (req, res) => {
    const { id: orderId } = req.params
    const order = await Order.findOne({ _id: orderId })
    if (!order) throw new CustomError.NotFoundError(`No order with id ${orderId}`)
    checkPermission(req.user, order.user);
    const { paymentIntentId } = req.body;
    order.paymentIntentId = paymentIntentId;
    order.status = 'paid';
    await order.save()
    res.status(StatusCodes.OK).json({ order })
}

module.exports = {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    createOrder,
    updateOrder,
}

