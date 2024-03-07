const jwtSecret = process.env.JWT_SECRET
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

module.exports = authMiddleware;