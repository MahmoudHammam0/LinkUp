$(document).ready(function() {
    // Get the queries data attribute from the HTML
    const queriesString = $('#data').data('queries');

    // Convert the queries string into an array
    const queriesArray = queriesString ? queriesString.split(',') : [];

    // Create containers for users and posts
    const $usersContainer = $('<div>').attr('id', 'users-results');
    const $postsContainer = $('<div>').attr('id', 'posts-results');

    // Add containers to the results div
    $('#results').append($usersContainer).append($postsContainer);

    // Flags to check if headings have been added
    let usersHeadingAdded = false;
    let postsHeadingAdded = false;

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
                                <h3>${user.name}</h3>
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
                        $postsContainer.append(
                            `<div class="result-item">
                                <p>${post.content}</p>
                            </div>`
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
