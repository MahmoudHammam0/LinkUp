$(document).ready(function() {
    // the current user (sender)
    currentUserId = $('.main-container').data('current-id');
    
    // the other user (receiver)
    otherUserId = $('.main-container').data('other-id');

    const socket = io.connect("http://localhost:5001");

    // room = "chat_room_for_(chat.id)"
    const room = $('.main-container').data('room');
    const roomInfo = room.split('_');
    // roomId is the chat.id
    const roomId = roomInfo[roomInfo.length - 1];
    console.log(roomId);

    // Let's the current user join the room/chat with the chat id
    socket.emit('join', { room: room, current_user_id: currentUserId });


    // Populate the chat section with old messages stored in the database
    // Do that only when we open a chat (has room id), not for messages page
    if (roomId && roomId !== 'None') {
        $.ajax({
            url: `http://localhost:5001/api/v1/chats/${roomId}/messages`,
            method: "GET",
            dataType: "json",
            success: function(res) {
                res.forEach((message) => {
                    const messageParagraph = $('<p>').text(message.content);
                    const messageDiv = $('<div>').addClass('message-div');

                    // Sent messages
                    if (message.sender_id === currentUserId) {
                        messageParagraph.addClass('sent');
                        messageDiv.append(messageParagraph);

                        if (message.read) {
                            messageDiv.append('<div class="status" id="blue-status">✔✔</div>');
                        } else {
                            messageDiv.append('<div class="status">✔</div>');
                        }
                        
                        messageDiv.append(`<img src="${message.sender_img}">`);
                        messageDiv.css('justify-content', 'flex-end');
                    // Rceived messages
                    } else {
                        messageParagraph.addClass('received');
                        messageDiv.append(`<img src="${message.sender_img}">`);
                        messageDiv.append(messageParagraph);
                        messageDiv.css('justify-content', 'flex-start');
                    }
                    $('.messages').append(messageDiv);
                    if (message.sender_id != currentUserId && !message.read) {
                        markMessageAsRead(message.id);
                    }
                });

                // Keeps the messages section at the bottom so we don't have to scroll down
                var messageBody = document.querySelector('.messages');
                messageBody.scrollTop = messageBody.scrollHeight;
            }
        });
        
        
    }
    


    // Logic to send a message
    socket.on('message', function(data) {
        const senderId = data.senderId;
        const receiverId = data.receiverId;
        const content = data.messageContent;
        const senderImg = data.senderImg

        const messageParagraph = $('<p>').text(content);
        const messageDiv = $('<div>').addClass('message-div');
        let sender = '';

        // We're sending
        if (senderId === currentUserId) {
            messageParagraph.addClass('sent');
            messageDiv.append(messageParagraph);
            messageDiv.append('<div class="status">✔</div>');
            messageDiv.append(`<img src="${senderImg}">`);
            messageDiv.css('justify-content', 'flex-end');
            sender = 'You: '
        // We're receiving
        // Only show messages from the other user, to prevent receing messages from everyone
        } else {
            messageParagraph.addClass('received');
            messageDiv.append(`<img src="${senderImg}">`);
            messageDiv.append(messageParagraph);
            messageDiv.css('justify-content', 'flex-start');
        }

        $('.messages').append(messageDiv);

        // Keeps the messages section at the bottom so we don't have to scroll down
        var messageBody = document.querySelector('.messages');
        messageBody.scrollTop = messageBody.scrollHeight;

        $('.current-chat h5').html(`${sender}${content}`);
        $('.current-chat .time-ago').html(`• now`);
        moveChatToTop(roomId);
        
    });

    // Send a message when we hit send/submit
    $('#message-form').on('submit', function(event) {
        event.preventDefault();
        messageData = {
            senderId: currentUserId,
            receiverId: otherUserId,
            senderImg: $('.user-photo img').attr('src'),
            messageContent: $('#message').val()
        };
        console.log(messageData)
        if (messageData.messageContent !== '') {
            // Send the message through socket
            socket.send({
                message: messageData,
                room: room
            });
            $('#message').val('');

            requestData = {
                content: messageData.messageContent,
                sender_id: messageData.senderId,
                chat_id: roomId
            };
            console.log(requestData)
            // Store the message in the database
            $.ajax({
                url: "http://localhost:5001/api/v1/messages",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(requestData),
                success: function(res) {
                    console.log("Message created successfully", res);                    
                }
            })
        }
    });

    // Function to calculate time ago
    function getTimeAgo(date) {
        const now = new Date(); // Current time
        const seconds = Math.floor((now - date) / 1000); // Difference in seconds
    
        // If the difference is less than 60 seconds
        if (seconds < 60) return `${seconds}s`;
    
        // If the difference is less than 3600 seconds (1 hour)
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    
        // If the difference is less than 86400 seconds (1 day)
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    
        // For differences of 1 day or more
        return `${Math.floor(seconds / 86400)}d`;
    }

    // Populate the chat list of suggested chats with the following
    $.ajax({
        url: `http://localhost:5001/api/v1/chats/${currentUserId}/chats`, // Endpoint to get current user chats
        method: 'GET',
        success: function(data) {
            const chatList = $('.chat-list');
            data.forEach(chat => {
                // Get the latest message content, or show a default text if there is no latest message
                const latestMessage = chat.latest_message ? chat.latest_message.content : 'No messages yet';

                // Adds "You: " if the latest message was sent by the current (logged in) user
                let sender = '';
                if (chat.latest_message && chat.latest_message.sender_id === currentUserId) {
                    sender = 'You: ';
                }

                // Calculate time ago from the created_at timestamp
                const createdAt = chat.latest_message ? new Date(chat.latest_message.created_at) : null;
                const timeAgo = createdAt ? getTimeAgo(createdAt) : '';

                const chatItem = `
                    <div class="chat-item" data-chat-id="${chat.id}">
                        <img src="${chat.user_photo}" alt="User Photo" class="chat-user-photo">
                        <span>
                            ${chat.user_name}
                            <h5 class="latest-message">
                                ${sender}${latestMessage}
                            </h5>
                        </span>
                        ${createdAt ? `<h2 class="time-ago">• ${timeAgo}</h2>` : ''}
                    </div>
                `;

                // add the chatItem to the chat list
                const $chatItemElement = $(chatItem);

                if (chat.id === roomId) {
                    $chatItemElement.addClass('current-chat');
                }

                chatList.append($chatItemElement);
            });

            // Attach click event handler to each chat item, to open the chat
            $('.chat-item').on('click', function() {
                const chatId = $(this).data('chat-id');
                window.location.href = `/chat/${chatId}`;
            });
        },
        error: function() {
            console.error('Error fetching following users.');
        }
    });


    // Search
    // Handle "Enter" key press to submit the form
    $('#search-input').on('keypress', function(event) {
        if (event.key === 'Enter') { // Check if "Enter" key was pressed
            event.preventDefault();
            const query = $('#search-input').val().trim();
            if (query) {
                // Redirect to search results page with query as a parameter
                window.location.href = `/search/${query}`;
            }
        }
    });

    function moveChatToTop(chatId) {
        const chatItem = $(`.chat-item[data-chat-id="${chatId}"]`);
    
        if (chatItem.length) {
            chatItem.remove();
            chatItem.insertAfter($('.chat-title'));
        }
    }

    function markMessageAsRead(messageId) {
        $.ajax({
            url: `http://localhost:5001/api/v1/messages/${messageId}/read`,
            method: 'PUT',
            success: function(res) {
                console.log(`Message ${messageId} marked as read`, res);
            }
        });
    }
});