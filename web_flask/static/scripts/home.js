$(document).ready(function() {

    $(document).on('click', '.reg', function() {
        $('.reg').prop('disabled', true);
        $('form').removeClass('login-form');
        $('form').addClass('signup-form');
        
        $('form').fadeOut(400, function() {

            $('form').empty();
            $('.error').empty();
            
            $('form').append(`
                <div id="username-error" class="field-error"></div>
                <input id="username" type="text" minlength=3 maxlength=28 placeholder="Username" required>
                <input id="name" type="text" minlength=3 maxlength=30 placeholder="Name" required>
                <div id="email-error" class="field-error"></div>
                <input id="email" type="email" placeholder="Email" required>
                <div class="field-error password-error"></div>
                <input id="password" type="password" placeholder="Password" required>
                <div class="field-error password-error"></div>
                <input id="password-confirm" type="password" placeholder="Confirm Password" required>
                <input type="submit" value="Sign Up">
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
            $('.error').empty();
            
            $('form').append(`
                <input id="email" type="email" placeholder="Email" required>
                <input id="password" type="password" placeholder="Password" required>
                <input type="submit" value="Log in">
            `);

            $('.form-container h2').html('Login');
            $('.ret').remove();
            $('.form-container').append('<button class="reg">Create New Account</button>');
            $('form').fadeIn(500);
        });
    });

    $(document).on('submit', '.login-form', function(event) {
        event.preventDefault();
        $('input[type="submit"]').prop('disabled', true);

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
                $('.error').html(x.responseJSON.Error);
            }
        });
    });

    function validEmail(email) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }

    function validatePassword(password, passwordConfirm) {
        const minLength = 8;
        const hasLetter = /[a-zA-Z]/.test(password);
        const isPasswordValid = password.length >= minLength && hasLetter;
        const isMatch = password === passwordConfirm;
    
        if (!isMatch) {
            $('.password-error').html('Passwords do not match. Please try again.').show();
            return false;
        }
        
        if (!isPasswordValid) {
            $('.password-error').html('Password must be at least 8 characters long and include at least one letter.').show();
            return false;
        }
    
        return true;
    }
    
    $(document).on('submit', '.signup-form', function(event) {
        event.preventDefault();
        $('.field-error').hide().html('');
    
        const email = $('#email').val();
        const password = $('#password').val();
        const passwordConfirm = $('#password-confirm').val();
    
        const emailValid = validEmail(email);
        const passwordsValid = validatePassword(password, passwordConfirm);
    
        if (!emailValid) {
            $('#email-error').html('Please enter a valid email address.').show();
        }
    
        if (emailValid && passwordsValid) {
            const requestData = {
                username: $('#username').val(),
                name: $('#name').val(),
                email: email,
                password: password
            };
    
            $.ajax({
                url: 'http://localhost:5001/api/v1/users',
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(requestData),
                success: function(res) {
                    console.log('User Created successfully', res);
                    $.ajax({
                        url: 'http://localhost:5000/',
                        method: "POST",
                        contentType: 'application/json',
                        data: JSON.stringify({
                            email: requestData.email,
                            password: requestData.password
                        }),
                        success: function(res) {
                            console.log("user loggedin successfully");
                            window.location.href = res.redirect_url;
                        },
                        error: function(x) {
                            $('.error').html(x.responseJSON.Error);
                        }
                    });
                },
                error: function(x) {
                    const errorObject = x.responseJSON.Error;
                    if (errorObject.email) {
                        $('#email-error').html(errorObject.email).show();
                    }
                    if (errorObject.username) {
                        $('#username-error').html(errorObject.username).show();
                    }
                }
            });
        }
    });
});