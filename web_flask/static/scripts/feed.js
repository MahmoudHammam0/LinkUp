const $ = window.$;
$(document).ready(function() {

    const userId = $('.stats').data('user-id');
    if (userId) {
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
    }

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
    
                    // Click event for follow button
                    /*
                    $('.follow-button').click(function() {
                        const followUserId = $(this).data('user-id');
                        $.ajax({
                            url: `http://localhost:5001/api/v1/users/${userId}/follow/${followUserId}`,
                            method: 'POST'
                        });
                    });
                    */
                }
            });
        }
    });

});
