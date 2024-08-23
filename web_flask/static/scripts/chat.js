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
});