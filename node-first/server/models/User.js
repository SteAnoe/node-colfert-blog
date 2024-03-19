const mongoose = require('mongoose');
const Message = require('./Message');  
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'], 
        default: 'user'
    },
    avatar: {
        data: String,
        contentType: String 
    },
    messages: [Message.schema],
})

module.exports = mongoose.model('User', UserSchema)