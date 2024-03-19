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
    cookie: {
        maxAge: 3 * 24 * 60 * 60 * 1000,
    },
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
app.use('/', require('./server/routes/book'));
app.use('/', require('./server/routes/user'));
app.use('/', require('./server/routes/job'));
app.use('/', require('./server/routes/message'));
app.use('/', require('./server/routes/conversation'));
//app.use('/', require('./server/routes/admin'));
app.use('/', router);


const server = app.listen(PORT, () =>{
    console.log(`App listening on port ${PORT}`);
});

const io = require('socket.io')(server, {
    cors: {
        origin: ["http://localhost:5000"],
    },
});

// io.on('connection', socket => {
//     console.log('Client connected, ID:', socket.id);

//     socket.on('sendMessage', (data) => {
//         console.log('Received Message:', data.message);
//         console.log('Conversation ID:', data.conversationId);
//         console.log('Notification sent to:', data.recipientId);
//         socket.join(data.conversationId);
//         // Send the message to the appropriate room (conversation)
//         socket.to(data.conversationId).emit('newMessage', data);
//         if (data.senderId !== data.recipientId) {
//             console.log('Sending notification to:', data.recipientId);
//             io.to(socket.id).emit('notification', 'You have a new message');
//         }
//     });

// });

// Initialize user-to-socket mapping
const userSocketMap = {};
io.on('connection', socket => {
    console.log('Client connected, ID:', socket.id);

    // Handle when a user joins the chat
    socket.on('joinChat', userId => {
        // Store the user's socket ID in the mapping
        if (userId) {
            if (!userSocketMap[userId]) {
                userSocketMap[userId] = [];
            }
            userSocketMap[userId].push(socket.id);
        }
        console.log('after joining', userSocketMap)
    });

    // Handle when a user sends a message
    socket.on('sendMessage', data => {
        console.log('Received Message:', data.message);
        console.log('Conversation ID:', data.conversationId);
        console.log('Notification sent to:', data.recipientId);
        socket.join(data.conversationId);
        // Send the message to the appropriate room (conversation)
        socket.to(data.conversationId).emit('newMessage', data);
        console.log(data)
        // Send notification to the recipient
        const recipientSocketIds = userSocketMap[data.recipientId];
        console.log('Recipient Socket IDs:', recipientSocketIds); // Add this line
        if (recipientSocketIds) {
            recipientSocketIds.forEach(socketId => {
                //if (socketId !== socket.id) { // Check if the socket ID is not the sender's ID
                    console.log('Emitting notification to socket ID:', socketId); // Add this line
                    io.to(socketId).emit('notification', data);
                //}
            });
        }
    });

    // Handle when a user disconnects
    socket.on('disconnect', () => {
        // Remove the disconnected socket ID from the mapping
        Object.keys(userSocketMap).forEach(userId => {
            userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);
            if (userSocketMap[userId].length === 0) {
                delete userSocketMap[userId];
            }
        });
    });
});

module.exports = io;
