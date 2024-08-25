$(document).ready(function() {
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

                if (filteredUsers.length > 0) {
                    // Check if the "Users:" exist, so we don't add it twice for each keyword
                    if (!usersHeadingAdded) {
                        $usersContainer.append('<h2>Users:</h2>');
                        usersHeadingAdded = true;
                    }
                    filteredUsers.forEach(user => {
                        $usersContainer.append(
                            `<div class="result-item">
                                <img class="user-img" src="${user.profile_photo}" onclick="window.location.href='http://localhost:5000/profile/${user.id}';">
                                <h3 onclick="window.location.href='http://localhost:5000/profile/${user.id}';">${user.name}</h3>
                                <button class="follow-button" data-user-id="${user.id}">Follow</button>
                            </div>`
                        );
                    });
                }
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
});
