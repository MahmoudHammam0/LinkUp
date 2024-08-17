$(document).ready(function() {
    const userId = $('.profile-header').data('id');
    let userObject = '';

    $('#edit-cover').on('click', function() {
        document.getElementById('cover-update').click();
    });

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
                }
            });
        }
    });

    $('#edit-photo').on('click', function() {
        document.getElementById('photo-update').click();
    });

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
                    console.log("cover photo updated successfully", res);
                }
            });
        }
    });

    const openFormBtn = document.getElementById('edit-profile');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const overlay = document.getElementById('overlay');

    openFormBtn.addEventListener('click', () => {
        overlay.style.display = 'flex';
    });

    closeFormBtn.addEventListener('click', () => {
        overlay.style.display = 'none';
    });

    $.ajax({
        url: `http://localhost:5001/api/v1/users/${userId}`,
        method: "GET",
        dataType: "json",
        success: function(res) {
            console.log(res);
            userObject = res;
        }
    });

    $.ajax({
        url: `http://localhost:5001/api/v1/users/${userId}/posts`,
        method: "GET",
        dataType: "json",
        success: function(res) {
            res.forEach((post) => {
                console.log(post);
                $('.posts').append(`
                    <div class="post-item">
                        <div class="post-header">
                            <div class="pic">
                                <img src=${userObject.profile_photo} alt="Profile Picture" />
                            </div>
                            <div class="details">
                                <h3>${userObject.name}</h3>
                                <p>${post.created_at}</p>
                            </div>
                        </div>
                        <div class="post-content">
                            <p class="content-text">${post.content}</p>
                            <div class="post-image">
                                <img src="" alt="post picture" />
                            </div>
                        </div>
                        <div class="likes-counter">
                            <img class="like-symbol" src="../static/images/like_symbol.png">
                            <span>${post.likes_no} Likes</span>
                        </div>
                        <div class="post-buttons">
                            <button>
                                <img class="thumbsup-symbol" src="../static/images/thumbsup-symbol.png">
                                Like
                            </button>
                            <button>
                                <img class="comment-symbol" src="../static/images/comment-symbol.png">
                                Comment
                            </button>
                        </div>
                    </div>
                `)
            });
        }
    });
});