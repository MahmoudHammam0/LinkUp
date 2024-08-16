const $ = window.$;
$(document).ready(function() {

    // Function that formats the date to: "MMM D, h:mm a"
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const formattedDate = date.toLocaleDateString('en-US', options);
        return `${formattedDate} ${date.getHours() >= 12 ? 'pm' : 'am'}`;
    }

    const userId = $('.stats').data('user-id');

    // Profile Card section ************************************************

    // The number of posts
    $.ajax({
        url: `http://localhost:5001/api/v1/users/${userId}/posts`,
        type: 'GET',
        success: function (response) {
            let totalPosts = 0;
            response.forEach(function (post) {
                totalPosts++;
            });
            $('#posts-count').append(totalPosts);
        }
    });

    //The number of followers
    $.ajax({
        url: `http://localhost:5001/api/v1/users/${userId}/followers`,
        type: 'GET',
        success: function (response) {
            let totalFollowers = 0;
            response.forEach(function (post) {
                totalFollowers++;
            });
            $('#followers-count').append(totalFollowers);
        }
    });

    // The number of following
    $.ajax({
        url: `http://localhost:5001/api/v1/users/${userId}/following`,
        type: 'GET',
        success: function (response) {
            let totalFollowing = 0;
            response.forEach(function (post) {
                totalFollowing++;
            });
            $('#following-count').append(totalFollowing);
        }
    });


    // Feed Section **********************************************************

    // Create Post
    $('.post-form button').on('click', function(event) {
        event.preventDefault();

        const content = $('textarea[name="content"]').val();
        const userId = $('.post-form').data('user-id');
        const title = "Feed Title"; // Random static title for now

        const postData = {
            title: title,
            content: content
        };

        console.log('Sending data:', postData);

        $.ajax({
            url: `http://localhost:5001/api/v1/users/${userId}/posts`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(postData),
            success: function(postResponse) {
                console.log('Post created successfully!', postResponse);

                // Extract user_id from response
                const postUserId = postResponse.user_id;

                // Fetch the user with the id to get their info
                $.ajax({
                    url: `http://localhost:5001/api/v1/users/${postUserId}`,
                    type: 'GET',
                    success: function(userResponse) {
                        const formattedDate = formatDate(postResponse.created_at);

                        // Create a new post element
                        const newPost = `
                            <article class="post">
                                <header>
                                    <img src="../static/images/4.jpg" alt="User Avatar">
                                    <div class="user-info">
                                        <h3>${userResponse.name}</h3>
                                        <h5>${formattedDate}</h5>
                                    </div>
                                </header>
                                <h2 class="post-title">${postResponse.title}</h2>
                                <p class="text-content">${postResponse.content}</p>
                                <div class="likes-counter">
                                    <img class="like-symbol" src="../static/images/like_symbol.png">
                                    <span>0 Likes</span>
                                </div>
                                <div class="post-buttons">
                                    <img class="thumbsup-symbol" src="../static/images/thumbsup-symbol.png">
                                    <button>Like</button>
                                    <img class="comment-symbol" src="../static/images/comment-symbol.png">
                                    <button>Comment</button>
                                </div>
                            </article>
                        `;

                        // Prepend the new post to the feed
                        $('.feed').children().first().after(newPost);

                        // Clear the textarea
                        $('textarea[name="content"]').val('');
                    },
                    error: function(xhr, status, error) {
                        console.error('Failed to fetch user details.', xhr.responseText);
                    }
                });
            },
            error: function(xhr, status, error) {
                console.error('Failed to create post.', xhr.responseText);
            }
        });
    });


    // Suggestions section ***************************************************

    // Display Suggested users to follow
    $.ajax({
        url: 'http://localhost:5001/api/v1/users',
        method: 'GET',
        success: function(allUsers) {
            // Fetch users the current user follows
            $.ajax({
                url: `http://localhost:5001/api/v1/users/${userId}/following`,
                method: 'GET',
                success: function(followingUsers) {
                    // Create suggestions array
                    const suggestions = [];
    
                    for (let i = 0; i < allUsers.length; i++) {
                        let userIsFollowing = false;
    
                        // Check if current user is in the following list
                        for (let j = 0; j < followingUsers.length; j++) {
                            if (allUsers[i].id === followingUsers[j].id) {
                                userIsFollowing = true;
                                break;
                            }
                        }
    
                        // If the user isn't followed, add it to suggestions
                        if (!userIsFollowing) {
                            suggestions.push(allUsers[i]);
                        }
                    }
    
                    // Display suggestions
                    const suggestionsList = $('.suggestions ul');
                    suggestionsList.empty();
                    for (let i = 0; i < suggestions.length; i++) {
                        const user = suggestions[i];
                        suggestionsList.append(`
                            <li>
                                <img src="../static/images/2.jpg">
                                <span>${user.name} <h5>1 Mutual Friend</h5> </span>
                                <button class="follow-button" data-user-id="${user.id}">Follow</button>
                            </li>
                        `);
                    }
                }
            });
        }
    });


    // Follow Button
    $(document).on('click', '.follow-button', function() {
        const followButton = $(this);
        const followUserId = $(this).data('user-id');
        $.ajax({
            url: `http://localhost:5001/api/v1/users/${userId}/follow/${followUserId}`,
            method: 'POST',
            success: function() {
                // Update the button after following the user
                followButton.removeClass('follow-button').addClass('unfollow-button').text('Following')
    
                $.ajax({
                    url: `http://localhost:5001/api/v1/users/${userId}/followers`,
                    type: 'GET',
                    success: function (response) {
                        let totalFollowers = 0;
                        response.forEach(function (post) {
                            totalFollowers++;
                        });
                        $('#following-count').text(`Following: ${totalFollowers}`);
                    }
                });
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

                // Update followers count
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

});
