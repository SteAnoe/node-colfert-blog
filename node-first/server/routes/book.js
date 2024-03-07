const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Book = require('../models/Book');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminLayout = '../views/layouts/admin'
const jwtSecret = process.env.JWT_SECRET 
const authMiddleware = require('../helpers/authMiddleware');

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

//BOOK | GET
router.get('/books', async (req, res) => {
    try {
        const locals = {
            title: "Books",
        }
        const user = req.session.user
        const users = await User.find()
        const books = await Book.find()
        res.render('books', {locals, books, user, users, layout: adminLayout})
    } catch (error) {
        console.log(error)
    }   
});

//BOOK CREATE | GET
router.get('/add-book', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Add New Books",
        }
        const user = req.session.user
        const users = await User.find()

        res.render('books/add-book', {locals, user, users, layout: adminLayout})
    } catch (error) {
        console.log(error)
    }   
});

//BOOK CREATE | POST
router.post('/add-book', upload.single('img'), authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Add Post",
            user: req.user, 
        };
        try {

            const newBook = new Book({
                title: req.body.title,
                author: req.body.author,
                img:{
                    data: req.file.filename,
                    contentType: req.file.mimetype
                }
            });
            console.log(newBook)
            await newBook.save();
            res.redirect('/dashboard');
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
    }
});

//BOOK EDIT | PUT
router.put('/edit-book', authMiddleware, async (req, res) => {
    try {
        const bookId = req.body.bookId;
        const username = req.body.username; 
        const returnDate = req.body.returnDate;

        const existingBook = await Book.findById(bookId);
        if (!existingBook) {
            return res.status(404).json({ message: 'Book not found' });
        }
        

        if (!username || username === 'null') {
            existingBook.user = {
                userId: null,
                username: null,
            };
            existingBook.borrowedAt = null;  
            existingBook.returnedAt = null;
        } else {
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            existingBook.user = {
                userId: user._id,
                username: user.username,
            };

            existingBook.borrowedAt = new Date();
            existingBook.returnedAt = returnDate
            existingBook.pastUsers.unshift(existingBook.user);
        }

        await existingBook.save();

        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//BOOK DELETE | DELETE
router.delete('/delete-book', authMiddleware, async (req, res) => {
    try {
        const bookId = req.body.bookId;
        const existingBook = await Book.findById(bookId);
        if (existingBook.img.data && existingBook.img.data !== '' && existingBook.img.data !== undefined) {
            const imagePath = path.join(__dirname, '..', '..', 'public', 'uploads', existingBook.img.data);
            await fs.unlink(imagePath);
        }
        await Book.deleteOne({ _id: bookId });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error)
    }   
});

//BOOKS SEARCH | POST
router.post('/books', async (req, res) => {
    try {
        const searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, '');

        const data = await Book.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
                { author: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
            ],
        });

        res.json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;