
const Review = require('../models/Review')
const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { checkPermission } = require('../utils')
const { findOne } = require('../models/User')

const createReview = async (req, res) => {
    
    const productId = req.body.product
    const product = await Product.findOne({ _id: productId })

    if (!product) throw new CustomError.NotFoundError(`No product with id ${productId}`)

    const { userId } = req.user

    const alreadySubmitted = await Review.findOne({
        product: productId,
        user: userId
    })

    if (alreadySubmitted) throw new CustomError.BadRequestError('Already submitted review for this product')

    req.body.user = userId
    const review = await Review.create(req.body)

    res.status(StatusCodes.CREATED).json({ review })
}


const getAllReviews = async (req, res) => {
    
    const reviews = await Review.find({}).populate({ path: 'product', select: 'name company price'})
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}


const getSingleReview = async (req, res) => {
    const { id: reviewId } = req.params
    const review = await Review.findOne({ _id: reviewId }).populate({ path: 'product', select: 'name company price'})
    if (!review) throw new CustomError.NotFoundError(`No review with id ${review}`)
    res.status(StatusCodes.OK).json({ review })
}


const updateReview = async (req, res) => {

    const { id: reviewId } = req.params
    const review = await Review.findOne({ _id: reviewId })

    if (!review) throw new CustomError.NotFoundError(`No review with id ${reviewId}`)

    checkPermission(req.user, review.user)    
    
    const { comment, rating, title } = req.body
    
    review.comment = comment
    review.rating = rating
    review.title = title

    await review.save() 
    res.status(StatusCodes.OK).json({ review })
}

const deleteReview = async (req, res) => {
    
    const { id: reviewId } = req.params
    const review = await Review.findOne({ _id: reviewId })

    if (!review) throw new CustomError.NotFoundError(`No review with id ${reviewId}`)

    checkPermission(req.user, review.user)

    await review.remove()
    res.status(StatusCodes.OK).json({ msg: `Review with id ${reviewId} removed successfully! ` })
}


module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
}