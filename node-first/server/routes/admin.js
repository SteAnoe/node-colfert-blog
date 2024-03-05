const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
let isLoggedIn = false; 
const adminLayout = '../views/layouts/admin'
const jwtSecret = process.env.JWT_SECRET 
const multer = require('multer');
const path = require('path');

let storage = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req,file,cb){
        let ext = path.extname(file.originalname)
        cb(null, Date.now() + ext)
    }
})
let upload = multer({ 
    storage: storage, 
    fileFilter: function (req, file, callback) {
        if(
            file.mimetype === 'image/jpeg' ||
            file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/webp' ||
            file.mimetype === 'image/png'
        ){ 
            callback(null, true)
        } else { 
            callback(null, false)
        }
    },
    limits:{
        fileSize: 1024 * 1024 * 2
    }
});

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;

    const locals = {
        title: "Admin"
    }
    if(!token){
        isLoggedIn = false;
        console.log('non ho il token, sono loggato?', isLoggedIn)
        //return res.render('admin/index', {locals, layout: adminLayout})
        return res.redirect('admin');
    }

    try{
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        const user = await User.findById(req.userId);
        req.user = user;
        isLoggedIn = true;
        next();
    } catch(error){
        return res.status(401).json({message: 'Unauth'});
    }

}

const getIsLoggedIn = () => isLoggedIn;
// ADMIN | GET
router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: "Admin"
        }
        const user = undefined
        const message = ''
        if(isLoggedIn){
            res.redirect('/dashboard');
        }
        res.render('admin/index', {locals, isLoggedIn: getIsLoggedIn(), user, message, layout: adminLayout})
    } catch (error) {
        console.log(error)
    }   
});

// ADMIN - LOG | POST
router.post('/admin', async (req, res) => {
    try {
        const locals = {
            title: "Admin"
        }
         
        const {username, password} = req.body;
        const user = await User.findOne({username})
        req.session.authenticated = true
        req.session.user = user
        console.log(req.session.user)
        if(!user) {
            return res.status(401).json({message: 'Invalid credentials'})
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(401).json({message: 'Invalid credentials'})
        }

        const token = jwt.sign({ userId: user._id, username: user.username }, jwtSecret);
        res.cookie('token', token), {httpOnly: true};
        
        isLoggedIn = true;
        console.log('sono loggato', isLoggedIn)
        res.redirect('/dashboard');
    } catch (error) { 
        console.log(error)
    }   
});

// DASHBOARD | GET
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Admin - Dashboard",
        };

        // Modify the query to fetch posts only for the logged-in user
        const data = await Post.find({ user: req.userId });
        
        const user = req.user;
        res.render('admin/dashboard', { locals, isLoggedIn: getIsLoggedIn(), user, data, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});

// ADMIN - NEW POST | GET
router.get('/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Add Post",
            user: req.user, // Include user information
        };
        const user = req.user;
        const data = await Post.find();
        res.render('admin/add-post', { locals, isLoggedIn: getIsLoggedIn(), user, data, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});

// ADMIN - NEW POST | POST
router.post('/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Add Post",
            user: req.user, // Include user information
        };
        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body,
                user: req.userId, // Set user to the ObjectId of the logged-in user
            });
            await newPost.save();
            res.redirect('/dashboard');
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
    }
});

// ADMIN - EDIT POST | GET
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Edit Post",
            user: req.user, // Include user information
        };
        const user = req.user;
        const data = await Post.findOne({ _id: req.params.id });
        res.render('admin/edit-post', { locals, isLoggedIn: getIsLoggedIn(), user, data, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});

// ADMIN - EDIT POST | PUT
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Edit Post",
            user: req.user, // Include user information
        };

        // Ensure that the user field is not modified
        const updatedPost = {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now(),
        };

        await Post.findByIdAndUpdate(req.params.id, updatedPost);
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});

// ADMIN - DELETE POST | DELETE
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne({_id: req.params.id});
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error)
    }   
});

// ADMIN - LOGOUT | GET
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    isLoggedIn = false;
    req.session.destroy();   
    console.log('sloggo, sono loggato?', isLoggedIn)
    res.redirect('/');
});

//ADMIN - REGISTER | POST
router.post('/register', async (req, res) => {
    try {
        const locals = {
            title: "Admin"
        }
        
        const {username, password} = req.body;
        const avatar = {
            data: '/',
            contentType: 'image/jpeg',
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(409).json({ message: 'Username already in use' });
            }
            const user = await User.create({username,password: hashedPassword, avatar})
            const message = `User Created ${user.username}`
            //res.status(201).json({message: 'User Created', user})
            res.render('admin/index', {locals, message, user, layout: adminLayout})
        } catch (error) {
            if (error.code === 11000){
                res.status(409).json({message: 'User already in use'})
            }
            res.status(500).json({message: 'Internal server error'})
        }
        
    } catch (error) {
        console.log(error)
    }   
});


// ADMIN - NEW COMMENT | POST
router.post('/add-comment', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Add Comment",
            //user: req.user, // Include user information
        };
        console.log(locals.user)
        const postId = req.body.postId; // Assuming postId is sent in the request body
        const newComment = new Comment({
            body: req.body.body,
            user: req.userId,
        });
        const user = req.session.user
        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.comments.push(newComment);
        await post.save();

        // Fetch the post again with the populated comments
        const updatedPost = await Post.findById(postId).populate({
            path: 'user',
            select: 'username', // Only select the necessary fields
        }).populate({
            path: 'comments.user',
            select: 'username', // Only select the necessary fields
        });
        console.log(updatedPost)
        res.render('post', { locals, user, data: updatedPost, isLoggedIn, currentRoute: `/post/${postId}` });
    } catch (error) {
        console.log(error);
        // Handle errors and possibly render an error page
        res.status(500).render('error', { locals, error });
    }
});


// ADMIN EDIT || PUT
router.put('/edit-user', upload.single('avatar'), authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if (user.avatar.data != '/' && user.avatar.data != undefined) {
            const prevImagePath = path.join(__dirname, '..' , '..', 'public', 'uploads', user.avatar.data);
            await fs.unlink(prevImagePath);
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.avatar = {
            data: req.file.filename,
            contentType: req.file.mimetype,
        };

        await User.findByIdAndUpdate(userId, { avatar: user.avatar });

        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = { router, isLoggedIn, authMiddleware, getIsLoggedIn };
