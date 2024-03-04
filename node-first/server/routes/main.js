const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const admin = require('./admin');

// HOME | GET
router.get('', async (req, res) => {
    try {
        const locals = {
            title: "Colfert Blog"
        }
        const user = req.session.user
        const data = await Post.find().sort({ createdAt: -1 });
        
        res.render('index', {locals, user, isLoggedIn: admin.getIsLoggedIn(), data, currentRoute: '/'})
    } catch (error) {
        console.log(error)
    }   
});

// POST :id | GET
router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;
        console.log('post get, sono loggato?', admin.getIsLoggedIn())

        const data = await Post.findById(slug).populate({
            path: 'user',
            select: 'username', 
        }).populate({
            path: 'comments.user',
            select: 'username', 
        });

        const locals = {
            title: data.title
        }
        const user = req.session.user
        console.log(data.comments)
        res.render('post', { locals, user, data, isLoggedIn: admin.getIsLoggedIn(), currentRoute: `/post/${slug}` })
    } catch (error) {
        console.log(error)
    }
});

// POST | POST - search
router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "Search"
        }
        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")

        const data = await Post.find({
            $or: [
                {title : {$regex: new RegExp(searchNoSpecialChar, 'i')}},
                {body : {$regex: new RegExp(searchNoSpecialChar, 'i')}}
            ]
        });
       
        res.render("search", {
            data,
            locals
        })
    } catch (error) {
        console.log(error)
    }   
});



// ABOUT | GET
router.get('/about', (req, res) => {
    const user = req.session.user
    res.render('about',  { user, isLoggedIn: admin.getIsLoggedIn(), currentRoute: '/about'})
});


module.exports = router;










// PAGINATION (incomplete)

// router.get('', async (req, res) => {
//     try {
//         let perPage = 3;
//         let page = req.query.page || 1;

//         const data = await Post.aggregate([{ $sort: {createdAt: -1}}])
//         .skip(perPage * page - perPage)
//         .limit(perPage)
//         .exec();

//         const count = await Post.countDocuments();
//         const nextPage = parseInt(page) + 1;
//         const hasNextPage = nextPage <= Math.ceil(count / perPage);
        
//         res.render('index', {
//             data, 
//             current: page, 
//             nextPage: hasNextPage ? nextPage : null
//         })

//     } catch (error) {
//         console.log(error)
//     }
    
// });

// INSERT DATA IN DB

// function insertPostData(){
//     Post.insertMany([
//         {
//             title: "Titolo",
//             body: "Questo è il body"
//         },
//         {
//             title: "Titolo1",
//             body: "Questo è il body1"
//         },
//         {
//             title: "Titolo2",
//             body: "Questo è il body2"
//         },
//         {
//             title: "Titolo3",
//             body: "Questo è il body3"
//         },
//         {
//             title: "Titolo4",
//             body: "Questo è il body4"
//         },
//         {
//             title: "Titolo5",
//             body: "Questo è il body5"
//         },
//         {
//             title: "Titolo6",
//             body: "Questo è il body6"
//         }
//     ])
// }
// insertPostData();