require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const session = require('express-session');

const connectDB = require('./server/config/db');
const {isActiveRoute} = require('./server/helpers/routeHelpers');
const app = express();
const PORT = 5000 || process.env.PORT;

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    })
}));

app.use(express.static('public'));

app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

const { router, isLoggedIn } = require('./server/routes/admin');
app.use('/', require('./server/routes/main'));
//app.use('/', require('./server/routes/admin'));
app.use('/', router);


app.listen(PORT, () =>{
    console.log(`App listening on port ${PORT}`);
});