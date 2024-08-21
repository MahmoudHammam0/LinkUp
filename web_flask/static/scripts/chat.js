$(document).ready(function() {
    const socket = io.connect("http://localhost:5001");

    socket.on('connect', function() {
        console.log("Connected to server");
        socket.send("User Connected");
    });

    socket.on('message', function(data) {
        console.log("Message received: ", data);
        $('.messages').append($('<p>').text(data));
    });

    $('#send-btn').on('click', function() {
        socket.send($('#username').val() + ': ' + $('#message').val());
        $('#message').val('');
    });
});