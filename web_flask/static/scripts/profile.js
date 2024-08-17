$(document).ready(function() {
    const userId = $('.profile-header').data('id');

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
});