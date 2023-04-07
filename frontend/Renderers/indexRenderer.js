//getting messages from the preload process
window.addEventListener('message', event => {
    let message
    switch (event.data.type) {
        case 'USER_CLOCKED_IN':
            message = 'User clocked in successfully';
            break;
    
        case 'USER_ALREADY_CLOCKED_IN':
            message = 'User is already clocked in for today';
            showErrorModal(message);
            break
        case 'USER_CLOCKED_OUT':
            message = 'User clocked out successfully';
            break
        case 'USER_ALREADY_CLOCKED_OUT':
            message = 'User is already clocked out for today';
            showErrorModal(message);
            break
        case 'USER_NOT_CLOCKED_IN':
            message = 'User is not clocked in for today';
            showErrorModal(message);
    }
  });
  

  function scheduleNewDay() {
    const now = new Date();
    const millisUntilMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // Tomorrow
      0, // Midnight hours
      0, // Midnight minutes
      0 // Midnight seconds
    ) - now;
    setTimeout(() => {
        $('#content').load('../view/users.html'); //reload at midnight
      scheduleNewDay(); // Schedule the task again for the next midnight
    }, millisUntilMidnight);
}
  


// for loading html files as pages
$(document).ready(function() {
    scheduleNewDay();
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
const closeButton = document.querySelector('.closew')

minimizeButton.addEventListener('click', () => {
  window.api.minimize()
})


closeButton.addEventListener('click', () => {
  window.api.close()
})

//for showing errors
function showErrorModal(message) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#fff';
    modal.style.border = '1px solid #000';
    modal.style.padding = '20px';
    modal.style.zIndex = '9999';
  
    const messageElement = document.createElement('p');
    messageElement.innerText = message;
    modal.appendChild(messageElement);
  
    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    modal.appendChild(closeButton);
  
    document.body.appendChild(modal);
    
  }