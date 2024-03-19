const mongoose = require('mongoose');
const Message = require('./Message');  
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
    participants: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    messages: [Message.schema],
    notifications: []
});

module.exports = mongoose.model('Conversation', ConversationSchema)