const $ = window.$;
$(document).ready(function() {

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

    // Auto-adjusts <textarea> height to fit content
    $("textarea").each(function () {
        this.setAttribute("style", "height:" + (this.scrollHeight) + "px;overflow-y:hidden;");
    }).on("input", function () {
        this.style.height = 0;
        this.style.height = (this.scrollHeight) + "px";
    });

    // The current user's id
    const userId = $('.stats').data('user-id');

    // Gets the current user: currentUserObject
    $.ajax({
        url: `http://localhost:5001/api/v1/users/${userId}`,
        method: "GET",
        dataType: "json",
        success: function(res) {
            currentUserObject = res;
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


    // Navigation bar section **********************************************

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

    // Scroll Nav section
    $(window).on('scroll', function() {
        const scrollNavHTML = `
            <div class="scroll-nav">
                    <a href="/">
                        <img class="nav-icon" src="../static/images/home-icon.png" alt="Feed Icon">
                        <h2>Home</h2>
                    </a>

                    <a href="${profileUrl}">
                        <img class="nav-icon" id="profile-icon" src="../static/images/profile-icon.png" alt="Profile Icon">
                        <h2>Profile</h2>
                    </a>

                    <a href="/chat/${currentUserObject.id}">
                        <img class="nav-icon" id="message-icon" src="../static/images/message-icon.png" alt="Messages Icon">
                        <h2>Messages</h2>
                    </a>

                    <a href="/logout">
                        <img class="nav-icon" id="logout-icon" src="../static/images/logout-icon.png" alt="Logout Icon">
                        <h2>Logout</h2>
                    </a>
                </div>
        `;

        if ($(window).scrollTop() > 100) {
            if ($('.scroll-nav').length === 0) { // Only append if not already present
                $('.profile-card').append(scrollNavHTML);
            }
        } else {
            if ($('.scroll-nav').length > 0) { // Only remove if present
                $('.scroll-nav').remove();
            }
        }
    });


    // Feed Section **********************************************************

    // Create Post
    $('.post-form button').on('click', function(event) {
        event.preventDefault();
        $('textarea').each(function() {
            this.setAttribute("style", "height:" + 52 + "px;overflow-y:hidden;");
        })
        const content = $('textarea[name="content"]').val();
        const userId = $('.post-form').data('user-id');
        const photo = $('#file-upload')[0].files[0];

        if (!content.trim()) {
            $('.error-message').text('Did you forget to write something?').show().delay(3000).fadeOut();
            return;
        }

        const formData = new FormData();
        formData.append('content', content);

        if (photo) {
            formData.append('photo', photo);
        }

        console.log('Sending data:', formData);

        $.ajax({
            url: `http://localhost:5001/api/v1/users/${userId}/posts`,
            type: 'POST',
            processData: false,
            contentType: false,
            data: formData,
            success: function(postResponse) {
                console.log('Post created successfully!', postResponse);
                
                // Clear the textarea and the uploaded image
                $('textarea[name="content"]').val('');
                $('.image-preview').html('');
                
                // Base Attributes for the Like button
                thumbsup = "../static/images/thumbsup-symbol.png";
                likeClass = "likes";
                likeId = "";
                textId = "like";

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
                            <article class="post" data-id="${postResponse.id}">
                                <header>
                                    <img src="${currentUserObject.profile_photo}" alt="User Avatar" onclick="window.location.href='${profileUrl}';" style="cursor: pointer;">
                                    <div class="user-info">
                                        <h3 onclick="window.location.href='${profileUrl}';" style="cursor: pointer;">${userResponse.name}</h3>
                                        <h5>${formattedDate}</h5>
                                    </div>
                                </header>
                                <p class="text-content">${postResponse.content}</p>
                                ${postResponse.picture ? `<div class="post-photo"><img src="${postResponse.picture}" alt="Post Image"></div>` : ''}
                                <div class="post-buttons">
                                    <div class="${likeClass}" id="like-group">
                                        <img class="thumbsup-symbol" src="${thumbsup}" id="${likeId}">
                                        <h5 id="${textId}">Like</h5>
                                    </div>
                                    <div class="comment-group">
                                        <img class="comment-symbol" src="../static/images/comment-symbol.png">
                                        <h5 id="comment">Comment</h5>
                                    </div>
                                </div>
                            </article>
                        `;

                        // Prepend the new post to the feed
                        $('.feed').children().first().after(newPost);
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

    // Changes Color of Post form when textarea is selected or typing
    $('.post-form').on('click', function() {
        $(this).addClass('typing');
    
        // Handle click events outside the form
        $(document).on('click', function(event) {
            if (!$(event.target).is('.post-form, .post-form *')) {
                // Remove 'typing' class if clicked outside the form
                $('.post-form').removeClass('typing');
            }
        });
    });

    // Show the button when the user writes something
    $('textarea[name="content"]').on('input', function() {
        const content = $(this).val().trim();
    
        if (content.length > 0) {
            $('.post-button').fadeIn();
        } else {
            $('.post-button').fadeOut();
        }
    });

    // Handle file upload and preview
    $('#file-upload').on('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Display the uploaded image in the preview section
                $('.image-preview').html(`<img src="${e.target.result}" alt="Image Preview">`);
            };
            reader.readAsDataURL(file);
        } else {
            // Clear the preview if no file is selected
            $('.image-preview').html('');
        }
    });


    // Populate the feed with posts from followed users
    $.ajax({
        url: `http://localhost:5001/api/v1/users/${userId}/following/posts`,
        type: 'GET',
        success: function(postsResponse) {
            let postsHTML = '';
            postsResponse.forEach(function(post) {

                // Check if the current user likes this post so we can update the thumbs up img
                if (currentUserObject.liked_posts.includes(post.id)) {
                    thumbsup = "../static/images/blue-like-button-icon.png";
                    likeClass = "unlike";
                    likeId = "blue-like";
                    textId = "liked";
                } else {
                    thumbsup = "../static/images/thumbsup-symbol.png";
                    likeClass = "likes";
                    likeId = "";
                    textId = "like";
                }

                // Display the likes counter based on the number of likes
                let likeText = '';
                if (post.likes_no > 0) {
                    likeText = post.likes_no === 1 ? '1 Like' : `${post.likes_no} Likes`;
                }

                // Display the comments counter based on the number of comments
                let commentText = '';
                if (post.comments_no > 0) {
                    commentText = post.comments_no === 1 ? '1 Comment' : `${post.comments_no} Comments`;
                }

                postsHTML += `
                    <article class="post" data-id="${post.id}" data-user-id="${post.user_id}">
                        <header>
                            <img src="${post.user_photo}" alt="User Avatar" onclick="window.location.href='/profile/${post.user_id}';" style="cursor: pointer;">
                            <div class="user-info">
                                <h3 onclick="window.location.href='/profile/${post.user_id}';" style="cursor: pointer;">${post.user_name}</h3>
                                <h5>${formatDate(post.created_at)}</h5>
                            </div>
                        </header>
                        <p class="text-content">${post.content}</p>
                        ${post.picture ? `<div class="post-photo"><img src="${post.picture}" alt="Post Image"></div>` : ''}
                        ${(post.likes_no > 0 || post.comments_no > 0) ? `
                            <div class="likes-counter">
                                ${post.likes_no > 0 ? `
                                    <img class="like-symbol" src="../static/images/like_symbol.png">
                                    <span class="likes_no"  id="likes_no">${likeText}</span>
                                ` : ''}
                                ${post.comments_no > 0 ? `
                                    <span class="comments_no">${commentText}</span>
                                ` : ''}
                            </div>
                        ` : ''}
                        <div class="post-buttons">
                            <div class="${likeClass}" id="like-group">
                                <img class="thumbsup-symbol" src="${thumbsup}" id="${likeId}">
                                <h5 id="${textId}">Like</h5>
                            </div>
                            <div class="comment-group">
                                <img class="comment-symbol" src="../static/images/comment-symbol.png">
                                <h5 id="comment">Comment</h5>
                            </div>
                        </div>
                    </article>
                `;
            });

            // Append posts to the feed
            $('.feed').append(postsHTML);
        },
        error: function(xhr, status, error) {
            console.error('Failed to fetch posts:', xhr.responseText);
        }
    });

    // Like Button
    $('.feed').on('click', '.likes', function() {
        const postItem = $(this).closest('.post');
        const postId = postItem.data('id');
        const otherUser = postItem.data('user-id');
        const requestData = {
            user_id: userId,
            post_id: postId
        };

        $.ajax({
            url: "http://localhost:5001/api/v1/likes",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(requestData),
            success: function(res) {
                const likeCounter = postItem.find('#likes_no');
                const counterText = res.like_no === 1 ? '1 Like' : `${res.like_no} Likes`;

                // Check if .likes-counter exists, and handle accordingly
                // If the counter is at 0, when liking for the first time

                // If there are no comments or likes
                if (postItem.find('.likes-counter').length === 0) {
                    // Add the whole counter section
                    postItem.find('.post-buttons').before(`
                        <div class="likes-counter">
                            <img class="like-symbol" src="../static/images/like_symbol.png">
                            <span class="likes_no" id="likes_no">${counterText}</span>
                        </div>
                    `);
                // if there are comments or likes
                } else {
                    // If there is a comments counter
                    if (postItem.find('.comments_no').length !== 0) {
                        // If there are no likes
                        if (likeCounter.length === 0) {
                            // prepend the likes counter to it
                            postItem.find('.likes-counter').prepend(`
                                <img class="like-symbol" src="../static/images/like_symbol.png">
                                <span id="likes_no">${counterText}</span>
                            `);
                        // If there are likes
                        } else {
                            likeCounter.html(counterText);
                        }
                    // if there are likes
                    } else {
                        likeCounter.html(counterText);
                    }
                }
                
                // Change like text to blue
                const likeText = postItem.find('.likes h5');
                likeText.text('Liked').attr('id', 'liked');

                const likeImage = postItem.find('.likes img');

                // Remove the element, update its attributes, and reinsert it
                likeImage.remove(); // Remove the img element
                
                postItem.find('.likes').prepend(`
                    <img class="new-class thumbsup-symbol" src="../static/images/blue-like-button-icon.png" id="blue-like">
                `);

                // Force redraw
                const newLikeImage = postItem.find('.thumbsup-symbol');
                newLikeImage.hide().show(0);

                postItem.find('.likes').addClass('unlike').removeClass('likes');

                const notifyData = {
                    content: `${currentUserObject.name} liked your post`,
                    type: 'like',
                    user_id: otherUser
                }

                $.ajax({
                    url: `http://localhost:5001/api/v1/notifys`,
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(notifyData),
                    success: function(res) {
                        console.log(res);
                    }
                })
            }
        });
    });

    // Unlike Button
    $('.feed').on('click', '.unlike', function() {
        const postItem = $(this).closest('.post');
        const postId = postItem.data('id');

        $.ajax({
            url: `http://localhost:5001/api/v1/likes/${postId}/${userId}`,
            method: "DELETE",
            dataType: "json",
            success: function(res) {
                const likeCounter = postItem.find('#likes_no');
                const counterText = res.like_no === 0 ? '' : (res.like_no === 1 ? '1 Like' : `${res.like_no} Likes`);

                // Update likes counter if there are 0 likes
                if (res.like_no === 0) {
                    // if there isn't a comment counter (0 comments)
                    if (postItem.find('.comments_no').length === 0) {
                        const likesCounter = postItem.find('.likes-counter');
                        // remove the whole counter section
                        likesCounter.remove();
                    // if the comments counter exist (1 or more comments)
                    } else if (postItem.find('.comments_no').length !== 0) {
                        // remove only the like counter
                        postItem.find('.like-symbol').remove();
                        postItem.find('#likes_no').remove();
                    }
                } else {
                    likeCounter.html(counterText);
                }

                // Change like text to grey
                const likeText = postItem.find('.unlike h5');
                likeText.text('Like').attr('id', 'like');

                const likeImage = postItem.find('.unlike img');

                // Remove the element, update its attributes, and reinsert it
                likeImage.remove(); // Remove the img element
                postItem.find('.unlike').prepend(`
                    <img class="newClass thumbsup-symbol" src="../static/images/thumbsup-symbol.png" id="">
                `);

                // Force redraw
                const newLikeImage = postItem.find('#blue-like');
                newLikeImage.hide().show(0);

                postItem.find('.unlike').addClass('likes').removeClass('unlike');
            }
        });
    });


    // Show post comments when you click on comment button
    $('.feed').on('click', '.comment-group, .comments_no', function() {
        const postItem = $(this).closest('.post');
        const otherUser = postItem.data('user-id');

        // Add id to these elements so we can click on it to hide the comments 
        postItem.find('.comment-group').attr('id', 'hide-comments');
        postItem.find('.comments_no').attr('id', 'hide-comments');

        if (postItem.find('input').length === 0) {
            postItem.append(`
                <div class="prev-comments">
                </div>
                <div class="comment-div">
                    <div class="pic">
                        <img src="${currentUserObject.profile_photo}" alt="Profile Picture" />
                    </div>
                    <form id="comment-form">
                        <div class="input-container">
                            <input class="comment-content" type="text" placeholder="Write a comment...">
                            <input type="submit" value="➜">
                        </div>
                    </form>
                </div>`
            );
        }

        const commentSection = postItem.find('.prev-comments');
        const postId = postItem.data('id');
        let commentSectionContent = '';
        console.log(postId);
        $.ajax({
            url: `http://localhost:5001/api/v1/posts/${postId}/comments`,
            method: "GET",
            dataType: "json",
            success: function(res) {
                // console.log(res);
                res.forEach((comment) => {
                    // console.log(comment);
                    commentSectionContent += `
                    <div class="post-comments">
                        <div class="pic">
                            <img src="${comment.User.profile_photo}" alt="Profile Picture" />
                        </div>
                        <div class="comment-item">
                            <div class="comment-writer">
                                ${comment.User.name}
                            </div>
                            ${comment.content}
                        </div>
                    </div>`;
                });

                commentSection.html(commentSectionContent);
            },
            error: function(xhr, status, error) {
                console.error('Failed to fetch comments:', xhr.responseText);
            }
        });
    });

    // Hide comments on second click on comment button or comments counter
    $('.feed').on('click', '#hide-comments', function() {
        const postItem = $(this).closest('.post');

        // Remove the #hide-comments ID
        postItem.find('.comment-group').removeAttr('id');
        postItem.find('.comments_no').removeAttr('id');

        // Hide the comments
        postItem.find('.prev-comments').remove();
        postItem.find('.comment-div').remove();
    });

    // Create a new comment
    $('.feed').on('submit', '#comment-form', function(event) {
        event.preventDefault();
    
        const postItem = $(this).closest('.post');
        const otherUser = postItem.data('user-id');
        const commentSection = postItem.find('.prev-comments');
        const commentContent = $(this).find('.comment-content').val();
        const postId = postItem.data('id');
    
        const requestData = {
            user_id: currentUserObject.id,
            post_id: postId,
            content: commentContent
        };
    
        if (commentContent !== '') {
            $.ajax({
                url: 'http://localhost:5001/api/v1/comments',
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(requestData),
                success: function(res) {
                    console.log("comment created successfully", res);
                    let commentSectionContent = '';

                    $.ajax({
                        url: `http://localhost:5001/api/v1/posts/${postId}/comments`,
                        method: "GET",
                        dataType: "json",
                        success: function(res) {
                            res.forEach((comment) => {
                                commentSectionContent += `
                                <div class="post-comments">
                                    <div class="pic">
                                        <img src="${comment.User.profile_photo}" alt="Profile Picture">
                                    </div>
                                    <div class="comment-item">
                                        <div class="comment-writer">
                                            ${comment.User.name}
                                        </div>
                                        ${comment.content}
                                    </div>
                                </div>`;
                            });
    
                            $('.comment-content').val(''); // Clear the comment input
                            commentSection.html(commentSectionContent);

                            // Update comment counter
                            const commentCounter = postItem.find('.comments_no');
                            const counterText = res.length === 1 ? '1 Comment' : `${res.length} Comments`;

                            if (postItem.find('.comments_no').length === 0) {
                                if (postItem.find('.likes_no').length === 0) {
                                    postItem.find('.likes_no').after(`
                                        <span class="comments_no">${counterText}</span>
                                    `);
                                } else {
                                    postItem.find('.post-buttons').after(`
                                        <div class="likes-counter">
                                            <span class="comments_no">${counterText}</span>
                                        </div>
                                    `);
                                }
                            } else {
                                commentCounter.html(counterText);
                            }
                        }.bind(this)
                    });

                    const notifyData = {
                        content: `${currentUserObject.name} commented on your post`,
                        type: 'comment',
                        user_id: otherUser
                    }
    
                    $.ajax({
                        url: `http://localhost:5001/api/v1/notifys`,
                        method: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(notifyData),
                        success: function(res) {
                            console.log(res);
                        }
                    })
                },
                error: function(err) {
                    console.error("Error creating comment", err);
                }
            });
        }
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

                        // Skips the current user
                        if (allUsers[i].id === userId) { continue; }
    
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

                        // Get the number of mutual friends
                        let mutualFriends;
                        $.ajax({
                            url: `http://localhost:5001/api/v1/users/${userId}/mutualswith/${user.id}`,
                            method: 'GET',
                            success: function(res) {
                                mutualFriends = res['count'];

                                // Determine the mutual friends text
                                let mutualFriendsText = '';
                                if (mutualFriends === 0) {
                                    mutualFriendsText = 'No Mutual Friends';
                                } else if (mutualFriends === 1) {
                                    mutualFriendsText = '1 Mutual Friend';
                                } else {
                                    mutualFriendsText = `${mutualFriends} Mutual Friends`;
                                }

                                suggestionsList.append(`
                                    <li>
                                        <img src="${user.profile_photo}" data-id="${user.id}">
                                        <span data-id="${user.id}">${user.name} <h5>${mutualFriendsText}</h5> </span>
                                        <button class="follow-button" data-user-id="${user.id}">Follow</button>
                                    </li>
                                `);
                            }
                        });

                        
                    }
                }
            });
        }
    });

    // Redirects to the user's profile when clicking on the image
    $(document).on('click', '.suggestions span, img', function() {
        suggestedUserId = $(this).data('id');
        console.log("event triggered");
        window.location.href = `/profile/${suggestedUserId}`;
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
                    auth_user_id: currentUserObject.id,
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

                const notifyData = {
                    content: `${currentUserObject.name} followed you`,
                    type: 'follow',
                    user_id: followUserId
                }

                $.ajax({
                    url: `http://localhost:5001/api/v1/notifys`,
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(notifyData),
                    success: function(res) {
                        console.log(res);
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

    $('#notification-bell').on('click', function() {
        $('.notification-dropdown ul').empty();
        $.ajax({
            url: `http://localhost:5001/api/v1/users/${currentUserObject.id}/notifys`,
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
