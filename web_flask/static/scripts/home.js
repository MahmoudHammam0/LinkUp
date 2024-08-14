$(document).ready(function() {
    
    $(document).on('click', '.reg', function() {
        $('.reg').prop('disabled', true);
        $('form').removeClass('login-form');
        $('form').addClass('signup-form');
        
        $('form').fadeOut(400, function() {

            $('form').empty();
            
            $('form').append(`
                <input type="text" placeholder="Username">
                <input type="text" placeholder="Name">
                <input type="email" placeholder="Email">
                <input type="password" placeholder="Password">
                <input type="password" placeholder="Confirm Password">
                <input id="signup" type="submit" value="Sign Up">
            `);

            $('.form-container h2').html('Sign up');
            $('.reg').remove();
            $('.form-container').append('<div class="ret"><img src="../static/images/prev.png">Login</div>');
            $('form').fadeIn(500);
        });
    });

    $(document).on('click', '.ret', function() {
        $('.ret').prop('disabled', true);
        $('form').addClass('login-form');
        $('form').removeClass('signup-form');

        $('form').fadeOut(400, function() {

            $('form').empty();
            
            $('form').append(`
                <input type="email" placeholder="Email">
                <input type="password" placeholder="Password">
                <input id="signup" type="submit" value="Login">
            `);

            $('.form-container h2').html('Login');
            $('.ret').remove();
            $('.form-container').append('<button class="reg">Create New Account</button>');
            $('form').fadeIn(500);
        });
    });

    $(document).on('submit', '.login-form', function(event) {
        event.preventDefault();

        const requestData = {
            email: $('#email').val(),
            password: $('#password').val()
        }

        $.ajax({
            url: 'http://localhost:5000/',
            method: "POST",
            contentType: 'application/json',
            data: JSON.stringify(requestData),
            success: function(res) {
                console.log("user loggedin successfully");
                window.location.href = res.redirect_url 
            },
            error: function(x, status, error) {
                $('.error').append(x.responseJSON.Error);
            }
        })
    })
});