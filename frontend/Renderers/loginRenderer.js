

async function verifyPassword(){
    try {
      let password = document.getElementById("password").value
      password = password.toString().trim();
    let status = await window.api.verifyPassword(password)
  if(status){
    $('#content').load('../view/admin.html');
  }else{
    showErrorModal("Heslo není správné, zkuste to znovu")
  }
    } catch (error) {
      console.error(error)
    }
    

}


