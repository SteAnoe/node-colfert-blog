const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BookSchema = new Schema({
    title:{
        type: String,
        required: true,
    },
    author:{
        type: String,
        required: true,
    },
    img:{
        data: String,
        contentType: String
    },
    user: {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        username: {
            type: String,
            default: null,
        },
    },
    pastUsers: [],
    borrowedAt:{
        type: Date,
        default: null
    },
    returnedAt:{
        type: Date,
        default: null
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('Book', BookSchema)