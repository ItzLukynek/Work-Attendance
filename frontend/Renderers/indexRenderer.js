

// for loading html files as pages
$(document).ready(function() {
    $('#content').load('../view/users.html');

    $('.load-page').click(function(e) {
    e.preventDefault();
    var url = $(this).data('url');
    $('#content').load(url);
    });
});
