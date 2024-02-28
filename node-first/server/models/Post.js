const mongoose = require('mongoose');
const Comment = require('./Comment');  
const Schema = mongoose.Schema;
const PostSchema = new Schema({
    title:{
        type: String,
        required: true,
    },
    body:{
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },
    comments: [Comment.schema],
})

module.exports = mongoose.model('Post', PostSchema)