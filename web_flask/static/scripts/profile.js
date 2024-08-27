$(document).ready(function() {
    const userId = $('.profile-header').data('id');
    const currentUserId = $('.container').data('id');
    let userObject = '';
    let currentUserObject = ''
    let thumbsup;
    let likeClass;
    let isFollowing = $('.unfollow-button').text() === 'Following';

    // Set CSS variable --info-height to the height of .info element (for album section to be able to acces info height in the css)
    document.documentElement.style.setProperty('--info-height', document.querySelector('.info').offsetHeight + 'px');

    // Function to format the date
    function formateDate(date) {
        const currntYear = new Date().getFullYear();
        const objectDate = new Date(date);

        const sameYearFormate = {
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hours12: true
        };

        const differentYearFormate = {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        };

        if (objectDate.getFullYear() === currntYear) {
            return objectDate.toLocaleString('en-US', sameYearFormate);
        } else {
            return objectDate.toLocaleString('en-US', differentYearFormate);
        }
    }

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

    // On click for edit cover photo button
    $('#edit-cover').on('click', function() {
        document.getElementById('cover-update').click();
    });

    // Update cover photo
    $('#cover-update').on('change', function(event) {
        const photo = this.files[0];
        if (photo) {
            const requestData = new FormData();
            requestData.append('cover', photo);

            $.ajax({
                url: `http://localhost:5001/api/v1/users/${userId}`,
                method: "PUT",
                data: requestData,
                processData: false,
                contentType: false,
                success: function(res) {
                    console.log("cover photo updated successfully", res);
                    location.reload();
                }
            });
        }
    });

    // On click for edit profile photo button
    $('#edit-photo').on('click', function() {
        document.getElementById('photo-update').click();
    });

    // Update profile photo
    $('#photo-update').on('change', function(event) {
        const photo = this.files[0];
        if (photo) {
            const requestData = new FormData();
            requestData.append('photo', photo);

            $.ajax({
                url: `http://localhost:5001/api/v1/users/${userId}`,
                method: "PUT",
                data: requestData,
                processData: false,
                contentType: false,
                success: function(res) {
                    console.log("profile photo updated successfully", res);
                    location.reload();
                }
            });
        }
    });

    // Fill the album section with the photos from previous posts
    $.ajax({
        url: `http://localhost:5001/api/v1/users/${currentUserId}/posts`,
        method: "GET",
        dataType: "json",
        success: function(res) {
            res.forEach((post) => {
                if (post.picture) {
                    const photoItem = $(`
                        <div class="photo-item">
                            <img src="${post.picture}" alt="post picture" />
                        </div>
                    `);
                    $('.photos').append(photoItem);
                }
            });
        }
    });  

    const openFormBtn = document.getElementById('edit-profile');
    const overlay = document.getElementById('overlay');

    // Edit profile: Opens the form to edit the profile info
    if (openFormBtn && overlay) {
        openFormBtn.addEventListener('click', () => {
            overlay.style.display = 'flex';
            console.log(currentUserObject)
            $('.form-container').html(`
                <div class="edit-header">
                    <h2>Edit profile</h2>
                    <div id="closeFormBtn" class="close-btn">X</div>
                </div>
                <div class="edit-info">
                    <div class="info-details bio-edit">
                        <h3>Bio</h3>
                        <h4>${currentUserObject.bio}</h4>
                        <button>Edit</button>
                    </div>
                    <div class="info-details educ-edit">
                        <h3>Education</h3>
                        <h4>${currentUserObject.education}</h4>
                        <button>Edit</button>
                    </div>
                    <div class="info-details work-edit">
                        <h3>Work</h3>
                        <h4>${currentUserObject.work}</h4>
                        <button>Edit</button>
                    </div>
                    <div class="info-details loc-edit">
                        <h3>Location</h3>
                        <h4>${currentUserObject.location}</h4>
                        <button>Edit</button>
                    </div>
                    <div class="info-details phone-edit">
                        <h3>Phone</h3>
                        <h4>${currentUserObject.phone}</h4>
                        <button>Edit</button>
                    </div>
                </div>`
            );
    
            $('#closeFormBtn').on('click', () => {
                overlay.style.display = 'none';
            });

            $('.info-details button').on('click', function() {
                const parentDiv = $(this).closest('.info-details');
                const fieldName = parentDiv.find('h3').text();
                
                if (!parentDiv.find('input').length) {
                    parentDiv.find('h4').remove();
                    parentDiv.find('h3').after(`<input type="text" placeholder="Enter your ${fieldName.toLowerCase()}">`);
                }
    
                $(this).text('Save');
            });

            $('.info-details button').on('click', function() {
                const parentDiv = $(this).closest('.info-details');
                const fieldName = parentDiv.find('h3').text().toLowerCase();
                const inputValue = parentDiv.find('input').val();

                if (inputValue && $(this).text() === 'Save') {
                    const requestData = {
                        [fieldName]: inputValue
                    }

                    $.ajax({
                        url: `http://localhost:5001/api/v1/users/${currentUserId}`,
                        method: "PUT",
                        contentType: "application/json",
                        data: JSON.stringify(requestData),
                        success: function(res) {
                            console.log(`${fieldName} updated successfully`, res);
                            parentDiv.find('input').remove();
                            parentDiv.find('button').text('Edit');
                            location.reload();
                        }
                    })
                }
            });
        });
    }

    // Gets the current (logged in) user
    $.ajax({
        url: `http://localhost:5001/api/v1/users/${currentUserId}`,
        method: "GET",
        dataType: "json",
        success: function(res) {
            currentUserObject = res;
        }
    });

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

    // Populates the profile page with the user's posts
    $.ajax({
        url: `http://localhost:5001/api/v1/users/${userId}`,
        method: "GET",
        dataType: "json",
        success: function(res) {
            userObject = res;
            
            $.ajax({
                url: `http://localhost:5001/api/v1/users/${userId}/posts`,
                method: "GET",
                dataType: "json",
                success: function(res) {
                    res.forEach((post) => {
                        if (currentUserObject.liked_posts.includes(post.id)) {
                            thumbsup = "../static/images/blue-like-button-icon.png";
                            likeClass = "unlike";
                        } else {
                            thumbsup = "../static/images/thumbsup-symbol.png";
                            likeClass = "likes";
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

                        const postItem = $(`
                            <div class="post-item" data-id="${post.id}">
                                <div class="post-header">
                                    <div class="pic">
                                        <img src=${userObject.profile_photo} alt="Profile Picture" />
                                    </div>
                                    <div class="details">
                                        <h3>${userObject.name}</h3>
                                        <p>${formateDate(post.created_at)}</p>
                                    </div>
                                </div>
                                <div class="post-content">
                                    <p class="content-text">${post.content}</p>
                                </div>
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
                                    <button class="${likeClass}">
                                        <img class="thumbsup-symbol" src="${thumbsup}">
                                        Like
                                    </button>
                                    <button class="comment">
                                        <img class="comment-symbol" src="../static/images/comment-symbol.png">
                                        Comment
                                    </button>
                                </div>
                            </div>
                        `);
            
                        if (post.picture) {
                            postItem.find('.post-content').append(`
                                <div class="post-image">
                                    <img src="${post.picture}" alt="post picture" />
                                </div>
                            `);
                        }
            
                        $('.posts').append(postItem);
                    });
                }
            });
        }
    });

    // Displays the comments section when you click on the comment button
    $('.posts').on('click', '.comment, .comments_no', function() {
        const postItem = $(this).closest('.post-item');

        // Add id to these elements so we can click on it to hide the comments 
        postItem.find('.comment').attr('id', 'hide-comments');
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
        let commentSectionContent = ''
        console.log(postId)
        $.ajax({
            url: `http://localhost:5001/api/v1/posts/${postId}/comments`,
            method: "GET",
            dataType: "json",
            success: function(res) {
                res.forEach((comment) => {
                    console.log(comment);
                    commentSectionContent += `
                    <div class="post-comments">
                        <div class="pic">
                            <img src=${comment.User.profile_photo} alt="Profile Picture" />
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
            }
        });
    });

    // Hide comments on second click on comment button or comments counter
    $('.posts').on('click', '#hide-comments', function() {
        const postItem = $(this).closest('.post-item');

        // Remove the #hide-comments ID
        postItem.find('.comment').removeAttr('id');
        postItem.find('.comments_no').removeAttr('id');

        // Hide the comments
        postItem.find('.prev-comments').remove();
        postItem.find('.comment-div').remove();
    });

    // Add comment
    $('.posts').on('submit', '#comment-form', function(event) {
        event.preventDefault();
    
        const postItem = $(this).closest('.post-item');
        const commentSection = postItem.find('.prev-comments');
        const commentContent = postItem.find('.comment-content').val();
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
                    let commentSectionContent = ''
                    $.ajax({
                        url: `http://localhost:5001/api/v1/posts/${postId}/comments`,
                        method: "GET",
                        dataType: "json",
                        success: function(res) {
                            res.forEach((comment) => {
                                commentSectionContent += `
                                <div class="post-comments">
                                    <div class="pic">
                                        <img src=${comment.User.profile_photo}>
                                    </div>
                                    <div class="comment-item">
                                        <div class="comment-writer">
                                            ${comment.User.name}
                                        </div>
                                        ${comment.content}
                                    </div>
                                </div>`;
                            });
    
                            $('.comment-content').val('');
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
                        }
                    });

                    const notifyData = {
                        content: `${currentUserObject.name} commented your post`,
                        type: 'comment',
                        user_id: userId
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

    // Like button
    $('.posts').on('click', '.likes', function() {
        const postItem = $(this).closest('.post-item');
        const postId = postItem.data('id');
        const requestData = {
            user_id: currentUserId,
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
                const likeText = postItem.find('.likes');
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
                    user_id: userId
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

    // Unlike button
    $('.posts').on('click', '.unlike', function() {
        const postItem = $(this).closest('.post-item');
        const postId = postItem.data('id');

        $.ajax({
            url: `http://localhost:5001/api/v1/likes/${postId}/${currentUserId}`,
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
                const likeText = postItem.find('.unlike');
                likeText.text('Like').attr('id', ' ');

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

    // Opens the chat with the user
    $('.messages').on('click', function() {
        requestData = {
            auth_user_id: currentUserId,
            user_id: userId
        };

        $.ajax({
            url: "http://localhost:5001/api/v1/chats",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(requestData),
            success: function(res) {
                console.log("chat created successfully", res);
                window.location.href = `/chat/${res.id}`;
            }
        })
    });

    // Follow Button
    $(document).on('click', '.follow-button', function() {
        const followButton = $(this);
        const followUserId = userId;
        $.ajax({
            url: `http://localhost:5001/api/v1/users/${currentUserId}/follow/${followUserId}`,
            method: 'POST',
            success: function() {
                // Update the button after following the user: follow -> following
                followButton.removeClass('follow-button').addClass('unfollow-button').text('Following')
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
                        isFollowing = true;
                    }
                })

                const notifyData = {
                    content: `${currentUserObject.name} followed you`,
                    type: 'follow',
                    user_id: userId
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
        const unfollowUserId = userId;
    
        $.ajax({
            url: `http://localhost:5001/api/v1/users/${currentUserId}/unfollow/${unfollowUserId}`,
            method: 'POST',
            success: function() {
                // Change button back to "Follow"
                unfollowButton.removeClass('unfollow-button').addClass('follow-button').html('Follow');
                isFollowing = false;
            }

        });
    });

    // Changes text from "following" to "unfollow" on hover
    $(document).on('mouseenter', '.unfollow-button', function() {
        if (isFollowing === true) {
            $(this).text('Unfollow');  // Change text to 'Unfollow' on hover
        }
    }).on('mouseleave', '.unfollow-button', function() {
        if (isFollowing === true) {
            $(this).text('Following');  // Change text back to 'Following' on hover out
        }
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

    // $('.cover-photo').on('click', function() {
    //     overlay.style.display = 'flex';
    //     $('.form-container').html(`
    //         <div class="edit-header">
    //             <h2>${userObject.name}'s Cover photo</h2>
    //             <div id="closeFormBtn" class="close-btn">X</div>
    //         </div>
    //         <div class="photo-overlay">
    //             <img src="${userObject.cover_photo}" alt="Profile Picture" />
    //         </div>
    //         <div class="likes-counter">
    //             <img class="like-symbol" src="../static/images/like_symbol.png">
    //             <span>123 Likes</span>
    //         </div>
    //         <div class="post-buttons">
    //             <button>
    //                 <img class="thumbsup-symbol" src="../static/images/thumbsup-symbol.png">
    //                 Like
    //             </button>
    //             <button>
    //                 <img class="comment-symbol" src="../static/images/comment-symbol.png">
    //                 Comment
    //             </button>
    //         </div>
    //     `);

    //     $('#closeFormBtn').on('click', () => {
    //         overlay.style.display = 'none';
    //     });
    // });

    // $('.profile-pic img').on('click', function() {
    //     overlay.style.display = 'flex';
    //     $('.form-container').html(`
    //         <div class="edit-header">
    //             <h2>${userObject.name}'s Cover photo</h2>
    //             <div id="closeFormBtn" class="close-btn">X</div>
    //         </div>
    //         <div class="photo-overlay">
    //             <img src="${userObject.profile_photo}" alt="Profile Picture" />
    //         </div>
    //         <div class="likes-counter">
    //             <img class="like-symbol" src="../static/images/like_symbol.png">
    //             <span>123 Likes</span>
    //         </div>
    //         <div class="post-buttons">
    //             <button>
    //                 <img class="thumbsup-symbol" src="../static/images/thumbsup-symbol.png">
    //                 Like
    //             </button>
    //             <button>
    //                 <img class="comment-symbol" src="../static/images/comment-symbol.png">
    //                 Comment
    //             </button>
    //         </div>
    //     `);

    //     $('#closeFormBtn').on('click', () => {
    //         overlay.style.display = 'none';
    //     });
    // });
});