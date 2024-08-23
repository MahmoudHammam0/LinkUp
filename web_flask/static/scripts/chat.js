$(document).ready(function() {
    // the current user (sender)
    currentUserId = $('.main-container').data('current-id');
    
    // the other user (receiver)
    otherUserId = $('.main-container').data('other-id');

    const socket = io.connect("http://localhost:5001");

    socket.on('message', function(data) {
        senderId = data.senderId;
        receiverId = data.receiverId;
        content = data.messageContent;
        senderImg = data.senderImg

        const messageParagraph = $('<p>').text(content);
        const messageDiv = $('<div>').addClass('message-div');

        // We're sending
        if (senderId === currentUserId && receiverId === otherUserId) {
            messageParagraph.addClass('sent');
            messageDiv.append(messageParagraph);
            messageDiv.append(`<img src="${senderImg}">`);
            messageDiv.css('justify-content', 'flex-end');
        // We're receiving
        // Only show messages from the other user, to prevent receing messages from everyone
        } else if (senderId === otherUserId && receiverId === currentUserId) {
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
        socket.send(messageData);
        $('#message').val('');
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
                const chatUrl = `http://localhost:5000/chat?sender_id=${currentUserId}&receiver_id=${rcvrId}`;
                window.location.href = chatUrl;
            });
        },
        error: function() {
            console.error('Error fetching following users.');
        }
    });
});