$(document).ready(function() {
    // The current user id
    const userId = $('#data').data('current-user-id');

    let currentUser;
    // Get the current user
    $.ajax({
        url: `http://localhost:5001/api/v1/users/${userId}`,
        method: 'GET',
        success: function(user) {
            currentUser = user;
        }
    });

    $.ajax({
        url: `http://localhost:5001/api/v1/users/${userId}/notifys`,
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
    
    // Get the queries data attribute from the HTML
    const queriesString = $('#data').data('queries');

    // Convert the queries string into an array
    const queriesArray = queriesString ? queriesString.split(',') : [];

    // Put the original query string in the search bar
    $('#search-input').val(queriesArray.join(' '));

    // Create containers for users and posts search results
    const $usersContainer = $('<div>').attr('id', 'users-results');
    const $postsContainer = $('<div>').attr('id', 'posts-results');

    // Add containers to the results div
    $('#results').append($usersContainer).append($postsContainer);

    // Flags to check if headings have been added
    let usersHeadingAdded = false;
    let postsHeadingAdded = false;


    // Function that formats the date to: "MMM D, h:mm a"
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true
        };
        return date.toLocaleDateString('en-US', options);
    }

    
    // Populate the search page with search results
    // Iterate over each keyword and perform AJAX requests
    queriesArray.forEach(keyword => {
        // Fetch users
        $.ajax({
            url: 'http://localhost:5001/api/v1/users',
            method: 'GET',
            success: function(users) {
                // Find users with name conttaining the keyword
                const filteredUsers = users.filter(user =>
                    user.name.toLowerCase().includes(keyword.toLowerCase())
                );

                // followinglist of current user
                $.ajax({
                    url: `http://localhost:5001/api/v1/users/${userId}/following`,
                    method: 'GET',
                    success: function(users) {
                        const followingUsers = users;
                        console.log(followingUsers);

                        if (filteredUsers.length > 0) {
                            // Check if the "Users:" exist, so we don't add it twice for each keyword
                            if (!usersHeadingAdded) {
                                $usersContainer.append('<h2>Users:</h2>');
                                usersHeadingAdded = true;
                            }
                            filteredUsers.forEach(user => {
                                // Check if the user is already being followed by current_user
                                let isFollowing = false;
                                for (const key in followingUsers) {
                                    console.log(`Checking user with key: ${key}`);
                                    if (followingUsers[key].id === user.id) {
                                        console.log(`Found matching ID: ${followingUsers[key].id}`);
                                        isFollowing = true;
                                        break;
                                    }
                                }
                                // Change the class accordingly
                                const buttonClass = isFollowing ? 'unfollow-button' : 'follow-button';
                                // Change text to either follow or following
                                const followText = isFollowing ? 'Following' : 'Follow';
                                
                                $usersContainer.append(
                                    `<div class="result-item">
                                        <img class="user-img" src="${user.profile_photo}" onclick="window.location.href='http://localhost:5000/profile/${user.id}';">
                                        <h3 onclick="window.location.href='http://localhost:5000/profile/${user.id}';">${user.name}</h3>
                                        <button class="${buttonClass}" data-user-id="${user.id}">${followText}</button>
                                    </div>`
                                );
                            });
                        }
                    }
                });
            },
            error: function(xhr, status, error) {
                console.error(`Error fetching users for keyword "${keyword}":`, error);
            }
        });

        // Fetch posts
        $.ajax({
            url: 'http://localhost:5001/api/v1/posts',
            method: 'GET',
            success: function(posts) {
                // Find posts with content conttaining the keyword
                const filteredPosts = posts.filter(post =>
                    post.content.toLowerCase().includes(keyword.toLowerCase())
                );

                if (filteredPosts.length > 0) {
                    // Check if the "Posts:" exist, so we don't add it twice for each keyword
                    if (!postsHeadingAdded) {
                        $postsContainer.append('<h2>Posts:</h2>');
                        postsHeadingAdded = true;
                    }
                    filteredPosts.forEach(post => {
                        // The post owner
                        const user = post.user;
                        
                        $postsContainer.append(
                            `<article class="post" data-id="${post.id}">
                                <header>
                                    <img src="${user.profile_photo}" alt="User Avatar" onclick="window.location.href='http://localhost:5000/profile/${user.id}';" style="cursor: pointer;">
                                    <div class="user-info">
                                        <h3 onclick="window.location.href='http://localhost:5000/profile/${user.id}';" style="cursor: pointer;">${user.name}</h3>
                                        <h5>${formatDate(post.created_at)}</h5>
                                    </div>
                                </header>
                                <p class="text-content">${post.content}</p>
                                ${post.picture ? `<div class="post-photo"><img src="${post.picture}" alt="Post Image"></div>` : ''}
                                
                            </article>`
                        );
                    });
                }
            },
            error: function(xhr, status, error) {
                console.error(`Error fetching posts for keyword "${keyword}":`, error);
            }
        });
    });


    // Follow Button
    $(document).on('click', '.follow-button', function() {
        const followButton = $(this);
        const followUserId = $(this).data('user-id');
        $.ajax({
            url: `http://localhost:5001/api/v1/users/${userId}/follow/${followUserId}`,
            method: 'POST',
            success: function() {
                // Update the button after following the user: follow -> following
                followButton.removeClass('follow-button').addClass('unfollow-button').text('Following')
    
                // Update the number of following
                $.ajax({
                    url: `http://localhost:5001/api/v1/users/${userId}/following`,
                    type: 'GET',
                    success: function (response) {
                        let totalFollowing= 0;
                        response.forEach(function (post) {
                            totalFollowing++;
                        });
                        $('#following-count').text(`Following: ${totalFollowing}`);
                    }
                });

                requestData = {
                    auth_user_id: currentUser.id,
                    user_id: followUserId
                };
        
                // Create a new chat when following for the first time
                $.ajax({
                    url: "http://localhost:5001/api/v1/chats",
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(requestData),
                    success: function(res) {
                        console.log("chat created successfully", res);
                    }
                })
            },
        });
    });

    // Unfollow Button
    $(document).on('click', '.unfollow-button', function() {
        const unfollowButton = $(this);
        const unfollowUserId = unfollowButton.data('user-id');
    
        $.ajax({
            url: `http://localhost:5001/api/v1/users/${userId}/unfollow/${unfollowUserId}`,
            method: 'POST',
            success: function() {
                // Change button back to "Follow"
                unfollowButton.removeClass('unfollow-button').addClass('follow-button').text('Follow');

                // Update following count
                $.ajax({
                    url: `http://localhost:5001/api/v1/users/${userId}/following`,
                    type: 'GET',
                    success: function (response) {
                        let totalFollowing = 0;
                        response.forEach(function (post) {
                            totalFollowing++;
                        });
                        $('#following-count').text(`Following: ${totalFollowing}`);
                    }
                });
            }
        });
    });


    // New search
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

    $('#notification-bell').on('click', function() {
        $('.notification-dropdown ul').empty();
        $.ajax({
            url: `http://localhost:5001/api/v1/users/${userId}/notifys`,
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
