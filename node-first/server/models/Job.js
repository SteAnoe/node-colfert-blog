const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const JobSchema = new Schema({
    title:{
        type: String,
        required: true,
    },
    body:{
        type: String,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },
    applications: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
    }],
})

module.exports = mongoose.model('Job', JobSchema)