
 function getUsers() {
    try {
        let userD = window.api.getUsers();
        return userD;
    } catch (err) {
        
        return null;
    }
}

function clockIn(userid,button,scbutton){
    try {
        let info = window.api.clockIn(userid);
        const now = new Date();
        const time24 = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); // Format as "hh:mm" in 24-hour clock format
        button.innerHTML = "Příchod: " + time24.toString();
        button.disabled = true;
        scbutton.disabled = false;
        if(info){
            scbutton.innerHTML = "Odchod"
        }
    } catch (error) {
        showErrorModal(error);
        console.log(error);
    }
}
function clockOut(userid,button,scbutton){
    try {
        let info =  window.api.clockOut(userid);
        const now = new Date();
        const time24 = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); // Format as "hh:mm" in 24-hour clock format
        button.innerHTML = "Odchod: " + time24.toString();
        button.disabled = true;
        if(info){
            scbutton.disabled = true
        }else{
            scbutton.disabled = false;
            scbutton.innerHTML = "Příchod"
        }
    } catch (error) {
        showErrorModal(error);
        console.log(error);
    }
}

async function renderUsersPage() {
    let userdiv = document.getElementById('users');
    let users = getUsers();
    let timeLog = await fetch('../../backend/json/timelog.json').then(res => res.json());
    console.log(users);
    let html = '';
    users.forEach(user => {
      let name = user.firstName + " " + user.lastName;
  
      // Check if the user has clocked in today
      let today = new Date().toISOString().substr(0, 10);
      let todayLog = timeLog.find(log => log.date === today);
      let userLog = todayLog?.users.find(u => u.id === user.id);
      let shift0 = userLog?.shift0;
      let shift1 = userLog?.shift1;
      let clockInTime = shift0?.clockedin || shift1?.clockedin;
      let clockInDisabled = clockInTime ? 'disabled' : '';
      let clockOutTime = shift1?.clockedout;
      let clockOutDisabled = clockOutTime || !clockInTime ? 'disabled' : '';
      let clockat = "";
      let clockout = "";
      if (shift0?.clockedin && !shift1?.clockedin) {
        clockat = ": " + shift0.clockedin.substr(11, 5);
      } else if (shift1?.clockedin) {
        clockat = ": " + shift1.clockedin.substr(11, 5);
      }
      if (shift1?.clockedout) {
        clockout = ": " + shift1.clockedout.substr(11, 5);
      }
      let src = "../../public/Images/User.png";
      if (user.photo != "") {
        src = user.photo;
      }
  
      html += `
        <div class="card bg-dark text-white">
          <img src="${src}" class="card-img" alt="...">
          <div class="card-body d-flex flex-column align-items-center">
            <h5 class="card-title">${name}</h5>
            <div class="d-grid gap-2 d-flex justify-content center">
              <button class="btn btn-primary" onclick="clockIn(${user.id}, this ,this.nextElementSibling)" type="button" ${clockInDisabled}>Příchod${clockat}</button>
              <button class="btn btn-secondary" onclick="clockOut(${user.id},this,this.previousElementSibling)" type="button" ${clockOutDisabled}>Odchod${clockout}</button>
            </div>
          </div>
        </div>
      `;
    });
    userdiv.innerHTML = html;
  }
  
  



  function showErrorModal(message) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '9998';
  
    // Create modal
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#fff';
    modal.style.border = '1px solid #000';
    modal.style.padding = '20px';
    modal.style.zIndex = '9999';
    modal.style.color = 'black';
    modal.style.borderRadius = '12px'
  
    const messageElement = document.createElement('p');
    messageElement.innerText = message;
    modal.appendChild(messageElement);
  
    const closeButton = document.createElement('button');
    closeButton.style.borderRadius = '12px';
    closeButton.style.backgroundColor = 'black';
    closeButton.style.color = 'white';
    closeButton.innerText = 'Zavřít';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
      document.body.removeChild(modal);
    });
    modal.appendChild(closeButton);
  
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
  }
document.addEventListener('DOMContentLoad',renderUsersPage());


