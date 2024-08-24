$(document).ready(function() {
    // the current user (sender)
    currentUserId = $('.main-container').data('current-id');
    
    // the other user (receiver)
    otherUserId = $('.main-container').data('other-id');

    const socket = io.connect("http://localhost:5001");
    const room = $('.main-container').data('room');
    const roomInfo = room.split('_');
    const roomId = roomInfo[roomInfo.length - 1];
    console.log(roomId);

    socket.emit('join', { room: room, current_user_id: currentUserId });

    $.ajax({
        url: `http://localhost:5001/api/v1/chats/${roomId}/messages`,
        method: "GET",
        dataType: "json",
        success: function(res) {
            res.forEach((message) => {
                const messageParagraph = $('<p>').text(message.content);
                const messageDiv = $('<div>').addClass('message-div');

                // We're sending
                if (message.sender_id === currentUserId) {
                    messageParagraph.addClass('sent');
                    messageDiv.append(messageParagraph);
                    messageDiv.append(`<img src="${message.sender_img}">`);
                    messageDiv.css('justify-content', 'flex-end');
                // We're receiving
                // Only show messages from the other user, to prevent receing messages from everyone
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
        url: `http://localhost:5001/api/v1/users/${currentUserId}/following`, // Endpoint to get users following
        method: 'GET',
        success: function(data) {
            const chatList = $('.chat-list');
            chatList.empty(); // Clear existing list
            data.forEach(user => {
                const chatItem = `
                    <div class="chat-item" data-receiver-id="${user.id}">
                        <img src="${user.profile_photo}" alt="User Photo" class="chat-user-photo">
                        <span>${user.name}</span>
                    </div>
                `;

                // Prevents adding the current user to the chat list
                if (user.id !== currentUserId) {
                    chatList.append(chatItem);
                }
            });

            // Attach click event handler to each chat item, to open the chat
            $('.chat-item').on('click', function() {
                const rcvrId = $(this).data('receiver-id');
                requestData = {
                    auth_user_id: currentUserId,
                    user_id: rcvrId
                };
                $.ajax({
                    url: "http://localhost:5001/api/v1/chats",
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(requestData),
                    success: function(res) {
                        console.log("chat created successfully", res);
                        window.location.href = `/chat/${res.id}`;
                    }
                })
            });
        },
        error: function() {
            console.error('Error fetching following users.');
        }
    });
});