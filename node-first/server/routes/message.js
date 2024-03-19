const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const fs = require('fs').promises;
const Post = require('../models/Post');
const User = require('../models/User');
const Job = require('../models/Job');
const Comment = require('../models/Comment');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Book = require('../models/Book');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminLayout = '../views/layouts/admin'
const jwtSecret = process.env.JWT_SECRET 
const authMiddleware = require('../helpers/authMiddleware');
const io = require('../../app');
// router.post('/add-message', authMiddleware, async (req, res) => {
//     try {
//         const locals = {
//             title: "Add Message",
            
//         };
//         const user = req.session.user
//         const userId = req.body.userId;
//         const newMessage = new Message({
//             body: req.body.body,
//             user: user._id,
//         });
          
//         const receivingUser = await User.findById(userId);
        
//         if (!receivingUser) {
//             return res.status(404).json({ message: 'User not found' });
//         }
        
//         receivingUser.messages.push(newMessage);
//         await receivingUser.save();
//         console.log(user)
//         const selectedUser = await User.findById(userId).populate({
//             path: 'messages',
//             populate: {
//                 path: 'user',
//                 select: 'username',
//             },
//         });
//         console.log(selectedUser)
//         res.render('public/user-profile', { locals, user, selectedUser, isLoggedIn, currentRoute: `/post/${userId}` });
//     } catch (error) {
//         console.log(error);
//         res.status(500).render('error', { locals, error });
//     }
// });


router.post('/add-message', authMiddleware, async (req, res) => {
    try {
        const user = req.session.user._id;
        const userId = req.body.userId;
        const body = req.body.body;
        console.log('User logged', user)
        console.log('Msg to', userId)
        console.log('DR Giovanni', body)
        // Find existing conversation between the two users
        let existingConversation = await Conversation.findOne({
            participants: { $all: [user, userId] },
        });

        if (!existingConversation) {
            // If no existing conversation, create a new conversation
            const receivingUser = await User.findById(userId);

            if (!receivingUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            existingConversation = new Conversation({
                participants: [user, receivingUser._id],
                messages: [],
                notifications: {
                    user: 0,
                    userId: 0,
                }
                    
                
            });

            await existingConversation.save();
        }

        // Add the new message to the existing conversation
        const newMessage = new Message({
            body,
            user: user,
        });

        existingConversation.messages.push(newMessage);
        await existingConversation.save();

        // Emit the new message to relevant sockets
        // io.emit('newMessage', {
        //     conversationId: existingConversation._id,
        //     message: newMessage,
        // });

        res.status(200).json({ message: 'Message sent successfully', conversationId: existingConversation._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;