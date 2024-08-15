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

});
