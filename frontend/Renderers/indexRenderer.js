

// for loading html files as pages
$(document).ready(function() {
    $('#content').load('../view/users.html'); //load users.html as default page

    $('.load-page').click(function(e) {
        $(".nav-link").removeClass("active");
        $(this).addClass("active");
        e.preventDefault();
        var url = $(this).data('url');
        $('#content').load(url);
    });
});

//controls of the window
const minimizeButton = document.querySelector('.minimize')
const maximizeButton = document.querySelector('.maximize')
const closeButton = document.querySelector('.close')
const hideButton = document.querySelector('.hide')

minimizeButton.addEventListener('click', () => {
  window.api.minimize()
})

maximizeButton.addEventListener('click', () => {
  if (!maximizeButton.classList.contains('maximized')) {
    window.api.maximize()
    maximizeButton.classList.add('maximized')
  } else {
    window.api.unmaximize()
    maximizeButton.classList.remove('maximized')
  }
})

closeButton.addEventListener('click', () => {
  window.api.close()
})
