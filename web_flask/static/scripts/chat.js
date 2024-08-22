$(document).ready(function() {
    currentUserId = $('.main-container').data('id');
    const socket = io.connect("http://localhost:5001");

    socket.on('message', function(data) {
        senderId = data.userId;
        content = data.messageContent;
        senderImg = data.userImg

        const messageParagraph = $('<p>').text(content);
        const messageDiv = $('<div>').addClass('message-div');

        if (senderId === currentUserId) {
            messageParagraph.addClass('sent');
            messageDiv.append(messageParagraph);
            messageDiv.append(`<img src="${senderImg}">`);
            messageDiv.css('justify-content', 'flex-end');
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
            userId: currentUserId,
            userImg: $('.user-photo img').attr('src'),
            messageContent: $('#message').val()
        };
        socket.send(messageData);
        $('#message').val('');
    });
});