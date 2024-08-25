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
                });
            }
        });
    }
    


    // Logic to send a message
    socket.on('message', function(data) {
        senderId = data.senderId;
        receiverId = data.receiverId;
        content = data.messageContent;
        senderImg = data.senderImg

        const messageParagraph = $('<p>').text(content);
        const messageDiv = $('<div>').addClass('message-div');

        // We're sending
        if (senderId === currentUserId) {
            messageParagraph.addClass('sent');
            messageDiv.append(messageParagraph);
            messageDiv.append(`<img src="${senderImg}">`);
            messageDiv.css('justify-content', 'flex-end');
        // We're receiving
        // Only show messages from the other user, to prevent receing messages from everyone
        } else {
            messageParagraph.addClass('received');
            messageDiv.append(`<img src="${senderImg}">`);
            messageDiv.append(messageParagraph);
            messageDiv.css('justify-content', 'flex-start');
        }

        $('.messages').append(messageDiv);
        
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

    // Populate the chat list of suggested chats with the following
    $.ajax({
        url: `http://localhost:5001/api/v1/chats/${currentUserId}/chats`, // Endpoint to get current user chats
        method: 'GET',
        success: function(data) {
            const chatList = $('.chat-list');
            chatList.empty(); // Clear existing list
            data.forEach(chat => {
                const chatItem = `
                    <div class="chat-item" data-chat-id="${chat.id}">
                        <img src="${chat.user_photo}" alt="User Photo" class="chat-user-photo">
                        <span>${chat.user_name}</span>
                    </div>
                `;

                // add the chatItem to the chat list
                chatList.append(chatItem);
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
});