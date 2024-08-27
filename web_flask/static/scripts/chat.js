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

    // Let's the current user join the room/chat with the chat id
    socket.emit('join', { room: room, current_user_id: currentUserId });

    $.ajax({
        url: `http://localhost:5001/api/v1/users/${currentUserId}/notifys`,
        method: "GET",
        dataType: "json",
        success: function(res) {
            let unreadCount = 0;
            res.forEach((notify) => {
                if (!notify.read) {
                    unreadCount++;
                }
            })

            if (unreadCount > 0) {
                $('.notification-count').text(unreadCount);
            }
        }
    });


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
                    const messageDiv = $('<div>').addClass('message-div').attr('data-message-id', message.id);

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
    
    socket.on('user_joined', function(data) {
        const joinedUserId = data.user_id;
    
        if (joinedUserId === otherUserId) {
            console.log('Other user has joined the room');
    
            $('.message-div .status').each(function() {
                const messageDiv = $(this).closest('.message-div');
                const messageId = messageDiv.data('message-id');
                
                if ($(this).text() === '✔') {
                    socket.emit('update_message_status', { messageToUpdate: messageId, room: room });
                }
            });
        }
    });

    socket.on('update_message_status', function(data) {
        const messageId = data.messageToUpdate;
        
        // Find the message with the specified ID and update its status
        $(`.message-div[data-message-id="${messageId}"] .status`).text('✔✔').attr('id', 'blue-status');
    });

    // Logic to send a message
    socket.on('message', function(data) {
        const senderId = data.senderId;
        const receiverId = data.receiverId;
        const content = data.messageContent;
        const senderImg = data.senderImg
        const messageId = data.id

        const messageParagraph = $('<p>').text(content);
        const messageDiv = $('<div>').addClass('message-div').attr('data-message-id', messageId);

        // We're sending
        if (senderId !== currentUserId) {
            messageParagraph.addClass('received');
            messageDiv.append(`<img src="${senderImg}">`);
            messageDiv.append(messageParagraph);
            messageDiv.css('justify-content', 'flex-start');
            socket.emit('update_message_status', { messageToUpdate: messageId, room: room });
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
        let messageData = {
            senderId: currentUserId,
            receiverId: otherUserId,
            senderImg: $('.user-photo img').attr('src'),
            messageContent: $('#message').val(),
            chatId: roomId
        };
        if (messageData.messageContent !== '') {
            const tempMessageId = "ID";
            
            const messageParagraph = $('<p>').text(messageData.messageContent);
            const messageDiv = $('<div>').addClass('message-div').attr('data-message-id', tempMessageId);
            
            messageParagraph.addClass('sent');
            messageDiv.append(messageParagraph);
            messageDiv.append('<div class="status">✔</div>');
            messageDiv.append(`<img src="${messageData.senderImg}">`);
            messageDiv.css('justify-content', 'flex-end');

            $('.current-chat h5').html(`You: ${messageData.messageContent}`);
            $('.current-chat .time-ago').html(`• now`);
            moveChatToTop(roomId);
            
            $('.messages').append(messageDiv);

            $('#message').val('');

            var messageBody = document.querySelector('.messages');
            messageBody.scrollTop = messageBody.scrollHeight;
            
            requestData = {
                content: messageData.messageContent,
                sender_id: messageData.senderId,
                chat_id: roomId
            };
            // Store the message in the database
            $.ajax({
                url: "http://localhost:5001/api/v1/messages",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(requestData),
                success: function(res) {
                    console.log("Message created successfully", res);
                    socket.send({
                        message: messageData,
                        room: room
                    });
                    const newMessageId = res.id;
                    $(`.message-div[data-message-id="${tempMessageId}"]`).attr('data-message-id', newMessageId);                    
                }
            });
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
                const unreadNo = chat.unread ? chat.unread : '';

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
                        ${unreadNo ? `<div class="unread">${unreadNo}</div>` : ''}
                        ${createdAt ? `<h2 class="time-ago">• ${timeAgo}</h2>` : ''}
                    </div>
                `;

                // add the chatItem to the chat list
                const $chatItemElement = $(chatItem);

                if (unreadNo) {
                    $chatItemElement.find('.latest-message').removeClass('latest-message').addClass('latest-message-unread');
                }

                if (chat.id === roomId) {
                    $chatItemElement.addClass('current-chat');
                }

                chatList.append($chatItemElement);
            });

            // Attach click event handler to each chat item, to open the chat
            $('.chat-item').on('click', function() {
                const chatId = $(this).data('chat-id');
                const latestMessage = $(this).find('.latest-message-unread');
                if (latestMessage.length > 0) {
                    console.log("entered a chat item with unreaded messages")
                    $.ajax({
                        url: `http://localhost:5001/api/v1/chats/${chatId}/mark_read`,
                        method: "PUT",
                        dataType: "json",
                        success: function(res) {
                            window.location.href = `/chat/${chatId}`;
                            console.log(res);
                        }
                    });
                } else {
                    window.location.href = `/chat/${chatId}`;
                }
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

    $('#notification-bell').on('click', function() {
        $('.notification-dropdown ul').empty();
        $.ajax({
            url: `http://localhost:5001/api/v1/users/${currentUserId}/notifys`,
            method: "GET",
            dataType: "json",
            success: function(res) {
                res.forEach((notify) => {
                    $('.notification-dropdown ul').append(`<li class="notification-item">${notify.content}</li>`);
                    $.ajax({
                        url:`http://localhost:5001/api/v1/notifys/${notify.id}`,
                        method: "PUT",
                        contentType: "application/json",
                        data: JSON.stringify({
                            read: true
                        }),
                        success: function(res) {
                            console.log("updated read successfully", res);
                        }
                    })
                });

                $('.notification-dropdown').toggle();
                $('.notification-count').remove();
            }
        });
    });

    $(document).on('click', function(event) {
        if (!$(event.target).closest('.notification-container').length) {
            $('.notification-dropdown').hide();
            $('.notification-dropdown ul').empty();
        }
    });

});