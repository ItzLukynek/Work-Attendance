
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
        window.api.clockIn(userid);
        const now = new Date();
        const time24 = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); // Format as "hh:mm" in 24-hour clock format
        button.innerHTML = "Příchod: " + time24.toString();
        button.disabled = true;
        scbutton.disabled = false;
    } catch (error) {
        showErrorModal(error);
        console.log(error);
    }
}
function clockOut(userid,button){
    try {
        window.api.clockOut(userid);
        const now = new Date();
        const time24 = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); // Format as "hh:mm" in 24-hour clock format
        button.innerHTML = "Odchod: " + time24.toString();
        button.disabled = true;
    } catch (error) {
        showErrorModal(error);
        console.log(error);
    }
}

async function renderUsersPage() {
    let userdiv = document.getElementById('users');
    let users = getUsers();
    let timeLog = await fetch('../../backend/json/timelog.json').then(res => res.json());

    let html = '';
    users.forEach(user => {
        let name = user.firstName + " " + user.lastName;

        // Check if the user has clocked in today
        let today = new Date().toISOString().substr(0, 10);
        let todayLog = timeLog.find(log => log.date === today);
        let userLog = todayLog?.users.find(u => u.id === user.id);
        let clockInTime = userLog?.clockedin;
        let clockInDisabled = clockInTime ? 'disabled' : '';
        let clockOutTime = userLog?.clockedout;
        let clockOutDisabled = clockOutTime || !clockInTime ? 'disabled' : '';
        let clockat = "";
        let clockout = "";
        if(clockInTime){
            clockat = ": " + clockInTime.substr(11,5);
        } 
        if(clockOutTime){
            clockout = ": " + clockOutTime.substr(11,5);
        }

        html += `
            <div class="card bg-dark text-white">
                <img src="../../public/Images/User.png" class="card-img" alt="...">
                <div class="card-body d-flex flex-column align-items-center">
                    <h5 class="card-title">${name}</h5>
                    <div class="d-grid gap-2 d-flex justify-content center">
                    <button class="btn btn-primary" onclick="clockIn(${user.id}, this ,this.nextElementSibling)" type="button" ${clockInDisabled}>Příchod${clockat}</button>
                    <button class="btn btn-secondary" onclick="clockOut(${user.id},this)" type="button" ${clockOutDisabled}>Odchod${clockout}</button>
                  </div>
                  
                    </div>
                </div>
            </div>
        `;
    });
    userdiv.innerHTML = html;
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
document.addEventListener('DOMContentLoad',renderUsersPage());


