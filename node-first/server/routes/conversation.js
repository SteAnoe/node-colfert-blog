const express = require('express');
const router = express.Router();

// Import necessary models and middleware
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const authMiddleware = require('../helpers/authMiddleware');

// Define the route handler for fetching conversations
router.get('/conversations', authMiddleware, async (req, res) => {
    try {
        // Fetch conversations associated with the current user
        const userId = req.session.user._id;

        const conversations = await Conversation.find({ participants: userId })
            .populate({
                path: 'participants',
                select: 'username -_id' // Select only the username field and exclude the _id field
            });

        // Extract necessary data and filter out current user's own username
        const conversationsData = conversations.map(conversation => {
            const participants = conversation.participants.map(participant => participant.username);
            return {
                _id: conversation._id,
                participants: participants.filter(username => username !== req.session.user.username)
            };
        });

        // Send the conversations data along with the user ID as a response
        res.json(conversationsData);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/conversations/:conversationId', authMiddleware, async (req, res) => {
    try {
        // Extract conversation ID from request parameters
        const userId = req.session.user._id;
        const conversationId = req.params.conversationId;
        const conversation = await Conversation.findById(conversationId);
        console.log('Conversation ID:', conversationId);
        // Log the fetched conversation and its associated messages
        console.log('Fetched conversation:', conversation);
  
        res.json({ user: userId, conversation });
    } catch (error) {
        console.error('Error fetching messages for conversation:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;