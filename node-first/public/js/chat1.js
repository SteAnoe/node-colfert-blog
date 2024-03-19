//CLIENT

const socket = io('http://localhost:5000');
const userId = document.getElementById('userId').getAttribute('data-user-id');
let conversationId;

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
    joinConversation(userId);
});

socket.on('newMessage', (data) => {
    console.log('New Message:', data);
});

const generateUniqueConversationId = () => {
    return Date.now().toString();
};

const joinConversation = (otherUserId) => {
    conversationId = generateUniqueConversationId();

    socket.emit('joinConversation', conversationId, otherUserId);

    socket.emit('sendMessage', { message: 'Hello, let\'s chat!' }, conversationId);
};

const form = document.querySelector('#messageForm');
const input = document.querySelector('#messageInput');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('room:', conversationId);
    const message = input.value.trim();

    if (message) {
        socket.emit('sendMessage', { message }, conversationId);
        input.value = '';
    }
});


/////////////////////////////////////////////////

//SERVER
io.on('connection', socket => {
    console.log('Client connected, ID:', socket.id);

    socket.on('sendMessage', (data, conversationId) => {
        console.log('Received Message:', data.message);
        console.log('Room:', conversationId);

        if (conversationId) {
            socket.to(conversationId).emit('newMessage', data);
        } else {
            socket.broadcast.emit('newMessage', data);
        }
    });
    socket.on('joinConversation', (conversationId, otherUserId) => {
        socket.join(conversationId);
        console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
        // (Optional) You might want to emit this information back to the client
        // or store it in a way that ensures consistent room assignments.
        // For simplicity, you can emit it back to the client.
        socket.emit('joinedConversation', { conversationId, otherUserId });
    });
});
