$(document).ready(function() {
    const userId = $('.profile-header').data('id');
    const currentUserId = $('.container').data('id');
    let userObject = '';
    let currentUserObject = ''
    let thumbsup;
    let likeClass;
    let isFollowing = $('.unfollow-button').text() === 'Following';

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

    const openFormBtn = document.getElementById('edit-profile');
    const overlay = document.getElementById('overlay');

    // Edit profile: Opens the form to edit the profile info
    if (openFormBtn && overlay) {
        openFormBtn.addEventListener('click', () => {
            overlay.style.display = 'flex';
            $('.form-container').html(`
                <div class="edit-header">
                    <h2>Edit profile</h2>
                    <div id="closeFormBtn" class="close-btn">X</div>
                </div>
                <div class="edit-info">
                    <h4>Bio</h4>
                    <h4>Education</h4>
                    <h4>Work</h4>
                    <h4>Location</h4>
                    <h4>Phone</h4>
                </div>`
            );
    
            $('#closeFormBtn').on('click', () => {
                overlay.style.display = 'none';
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
                                <div class="likes-counter">
                                    <img class="like-symbol" src="../static/images/like_symbol.png">
                                    <span>${post.likes_no} Likes</span>
                                </div>
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
    $('.posts').on('click', '.comment', function() {
        const postItem = $(this).closest('.post-item');
    
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
                            <input type="submit" value=">">
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
                        }
                    });
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
                const likeCounter = postItem.find('.likes-counter span');
                likeCounter.html(`${res.like_no} Likes`);
                const likeImage = postItem.find('.likes img');
                likeImage.attr('src', '../static/images/blue-like-button-icon.png');
                postItem.find('.likes').addClass('unlike').removeClass('likes');
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
                const likeCounter = postItem.find('.likes-counter span');
                likeCounter.html(`${res.like_no} Likes`);
                const likeImage = postItem.find('.unlike img');
                likeImage.attr('src', "../static/images/thumbsup-symbol.png");
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