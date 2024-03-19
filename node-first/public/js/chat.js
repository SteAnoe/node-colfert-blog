const socket = io('http://localhost:5000');
let conversationId;

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
    socket.emit('joinChat', loggedUser);
});

const chatBtn = $('#chatBtn')
const form = document.querySelector('#messageForm');
const input = document.querySelector('#messageInput');
const conversationIdInput = document.getElementById('conversationId');
const userId = $('#userId').data('user-id');
const loggedUser = $('#loggedUser').data('user-id');
// Get conversation ID from hidden input field
conversationId = conversationIdInput.value.trim();

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    
   
    if (message) {
        try {
            const response = await fetch('/add-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId, // Replace userId with the actual user ID
                    body: message
                })
            });

            const data = await response.json();
            if (response.ok) {
                console.log('recepient', userId)
                console.log('Message saved successfully');
                conversationId = data.conversationId;
                console.log('Conv id', conversationId)
                // Emit message content and conversation ID to the server
                socket.emit('sendMessage', { message, conversationId, recipientId: userId , loggedUser});
                sendMessage(message)
                // Clear input field
                input.value = '';
            } else {
                console.error('Error:', data.message);
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
        
        input.value = '';
    }
});

socket.on('newMessage', data => {
    console.log('New Message:', data);
    const chatBox = document.querySelector('.chatBox');
    const msg = document.createElement('div');  
    msg.innerHTML = `
    <div class="d-flex justify-content-start">
    <div class="msg-received">${data.message}</div>
    </div>
    `
    chatBox.appendChild(msg);
    
});

function sendMessage(data){
    const chatBox = document.querySelector('.chatBox');
    const msg = document.createElement('div');
    msg.innerHTML = `
    <div class="d-flex justify-content-end">
    <div class="msg-sent">${data}</div>
    </div>
    `
    chatBox.appendChild(msg);
    
}
socket.on('notification', (data) => {
    console.log('Received notification:', data);
    // Display a notification to the user
    //alert(message);
    chatBtn.addClass('red');
});