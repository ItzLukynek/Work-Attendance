async function verifyPassword(){
    try {
      let password = document.getElementById("password").value
      password = password.toString().trim();
    let status = await window.api.verifyPassword(password)
  if(status){
    $('#content').load('../view/admin.html');
  }else{
    console.log("pico nejde to")
  }
    } catch (error) {
      console.error(error)
    }
    

}

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