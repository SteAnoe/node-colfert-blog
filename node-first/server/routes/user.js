const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Conversation = require('../models/Conversation');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminLayout = '../views/layouts/admin'
const jwtSecret = process.env.JWT_SECRET 
const multer = require('multer');
const path = require('path');

//USER | GET
router.get('/users', async (req, res) => {
    try {
        const locals = {
            title: "Users",
        }
        const user = req.session.user
        const users = await User.find()
        
        
        res.render('users', {locals, user, users, layout: adminLayout})
    } catch (error) {
        console.log(error)
    }   
});

// USER PROFILE | GET (Public Version)
router.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = req.session.user;
        const selectedUser = await User.findById(userId);
        
        if (!selectedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        let conversationId;
        const existingConversation = await Conversation.findOne({
            participants: { $all: [user._id, userId] },
        });

        if (existingConversation) {
            conversationId = existingConversation._id;
        }

        const locals = {
            title: `${selectedUser.username}'s Profile`,
            conversationId: conversationId, // Pass conversation ID to the view
        };

        res.render('public/user-profile', { locals, user, selectedUser, layout: adminLayout });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router ;