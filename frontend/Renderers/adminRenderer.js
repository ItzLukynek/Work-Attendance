

$(document).ready(()=>{
    loadtable();
    searchBar()
    document.getElementById("addUser").addEventListener("click",(event)=>{
        createUser()
    })
    document.getElementById("changePassword").addEventListener("click",(event)=>{
        changePassword()
    })
    
  });



function loadtable() {
    let users = window.api.getUsers();
    let usertable = document.getElementById("usertable");


    let html = `
      <table>
        <thead>
          <tr class="text-center">
            <th>Uživatelé</th>
          </tr>
        </thead>
        <tbody>
    `;
    users.forEach(user => {
      const fullName = `${user.firstName} ${user.lastName}`;
      html += `
        <tr class="user-row">
          <td>${fullName}</td>
          <td><div  class="flex-row d-flex"><a href="#" onclick="showMoreInfoAdmin(${user.id})"><div class="info-icon bg-primary"><i class="fas fa-info"></i></div></a><a href="#" onclick="editUser(${user.id})"><div class="info-icon bg-warning"><i class="fa-solid fa-pen"></i></div></a><a href="#" onclick="deleteUser(${user.id})"><div class="info-icon bg-danger"><i class="fa-solid fa-trash"></i></div></a></div></td>
          
        </tr>
      `;
    });
    
    html += `
        </tbody>
      </table>
    `;
    
    usertable.innerHTML = html;
  }

  
  function searchBar(){
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();
    const rows = document.getElementsByClassName("user-row");
    Array.from(rows).forEach(row => {
      const fullName = row.getElementsByTagName("td")[0].textContent.toLowerCase();
      if (fullName.includes(filter)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });
  }
  
 
  
   currentMonthNav = ""; //no let beacuse when i load the page second times it will trow error that the variable was already declared
   currentYearNav = "";

  function navigateMonth(direction, userId) {
    let currentDatee = new Date();
    if(currentYearNav === "" || currentMonthNav === ""){
        currentMonthNav = currentDatee.getMonth();
        currentYearNav = currentDatee.getFullYear();
    }
    if (direction === 'previous') {
      if (currentMonthNav === 0) {
        currentMonthNav = 11;
        currentYearNav--;
      } else {
        currentMonthNav--;
      }
    } else if (direction === 'next') {
      if (currentMonthNav === 11) {
        currentMonthNav = 0;
        currentYearNav++;
      } else {
        currentMonthNav++;
      }
    }
  
    const newTableHtml = generateClockInAndOutTable(userId, currentMonthNav, currentYearNav);
    const monthName = document.getElementById("monthname")

    if(currentDatee.getFullYear() === currentYearNav){
        monthName.innerHTML = getMonthName(currentMonthNav)
    }else{
        monthName.innerHTML = getMonthName(currentMonthNav) +" " + currentYearNav
    }
    const tableContainer = document.getElementById("usermonth");
    tableContainer.innerHTML = newTableHtml;
  }



  function showMoreInfoAdmin(userId) {
    const users = window.api.getUsers();
    let user = users.find(user => user.id === userId);
    const modalId = `user-modal-${userId}`;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); 
    const monthName = getMonthName(currentMonth);
    let usermonth = generateClockInAndOutTable(userId , currentMonth, currentYear);
  
    const modalHtml = `
          <div class='text-center'>
          <h2>${user.firstName} ${user.lastName}</h2>
          <h4 id="monthname">${monthName}</h4>
          </div>
          <div id="usermonth">${usermonth}</div>
          <div class="d-flex flex-row justify-content-end">
          <button class="btn btn-primary mr-3" onclick="navigateMonth('previous',${userId})">Předchozí měsíc</button>
          <button class="btn btn-primary mr-3" onclick="navigateMonth('next',${userId})">Následující měsíc</button>
          <button class="btn btn-light mr-3" onclick="closeModal('${modalId}')">Zavřít</button>
          </div>
        </div>
      
    `;
    showModal(modalHtml,modalId);
  
    
  }

function showModal(message, modalId){
    let html =` <div class="toolmodal active" id="${modalId}">
    <div class="toolmodal-background"></div>
    <div class="toolmodal-content">`
    let html2 =`</div></div>`
    message = html + message + html2

    document.body.insertAdjacentHTML('beforeend', message);
    const modal = document.getElementById(modalId);
    const modalBackground = modal.querySelector('.toolmodal-background');
  
    modalBackground.addEventListener('click', (event) => {
      closeModal(modalId);
    });
}


  function getMonthName(month, short = false) {
    const options = short ? { month: 'short' } : { month: 'long' };
    return new Intl.DateTimeFormat('cs-CZ', options).format(new Date(2022, month, 1));
  }
  function getClockInAndOutTimes(userId, month, year) {
    const timelogData = window.api.getTimelog();
  
    const userTimelogEntries = timelogData.filter((entry) => {
      const date = new Date(entry.date);
      return entry.users.some((user) => user.id === userId) &&
        date.getMonth() === month &&
        date.getFullYear() === year;
    });
  
    const clockInAndOutTimes = {}; // Use an object instead of an array
  
    userTimelogEntries.forEach((entry) => {
      const date = new Date(entry.date);
      entry.users.forEach((user) => {
        if (user.id === userId && user.shift0.clockedin && user.shift0.clockedout) {
          const clockInTime = new Date(user.shift0.clockedin);
          const clockOutTime = new Date(user.shift0.clockedout);
          clockInAndOutTimes[date.getDate()] = {
            ...clockInAndOutTimes[date.getDate()], // Merge with existing data (if any)
            shift0: {
              clockIn: formatTime(clockInTime),
              clockOut: formatTime(clockOutTime)
            }
          };
        }
        if (user.id === userId && user.shift1.clockedin && user.shift1.clockedout) {
          const clockInTime = new Date(user.shift1.clockedin);
          const clockOutTime = new Date(user.shift1.clockedout);
          clockInAndOutTimes[date.getDate()] = {
            ...clockInAndOutTimes[date.getDate()], // Merge with existing data (if any)
            shift1: {
              clockIn: formatTime(clockInTime),
              clockOut: formatTime(clockOutTime)
            }
          };
        }
      });
    });
  
    return clockInAndOutTimes;
  }
  
  
  function formatTime(time) {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  function generateClockInAndOutTable(userId, month, year) {
    const clockInAndOutTimes = getClockInAndOutTimes(userId, month, year);
    let workHours = window.api.calculateWorkTime(userId,year,month)
    console.log(workHours)
    console.log(clockInAndOutTimes);
  
    let html = '<div class="mt-3 mb-3 clockinout-table d-flex flex-row">\n';
    const daysInMonth = new Date(year, month + 1, 0).getDate();
  
    html += '<div><table class="mr-2"><thead><tr><th>Datum</th><th>Den</th><th>Příchod</th><th>Odchod</th><th>Příchod</th><th>Odchod</th></tr></thead>';
    html += '<tbody>';
  
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const formattedDate = `${i}. ${getMonthName(month, true)}`;
      const day = new Intl.DateTimeFormat('cs-CZ', { weekday: 'short' }).format(date);
      const shift0 = clockInAndOutTimes[i]?.shift0 || {}; // Access the shift0 object
      const shift1 = clockInAndOutTimes[i]?.shift1 || {}; // Access the shift1 object
      const clockInShift0 = shift0.clockIn || '-';
      const clockOutShift0 = shift0.clockOut || '-';
      const clockInShift1 = shift1.clockIn || '-';
      const clockOutShift1 = shift1.clockOut || '-';
      const isSpecialDay = day === 'so' || day === 'ne'; 
  
      if (i === 16) {
        html += '</tbody></table></div><div><table class="ml-2"><thead><tr><th>Datum</th><th>Den</th><th>Příchod</th><th>Odchod</th><th>Příchod</th><th>Odchod</th></tr></thead>'
        html += '<tbody>';
      }
  
      if (isSpecialDay) {
        html += '<tr class="special-day">';
      } else {
        html += '<tr>';
      }
  
      html += `<td>${formattedDate}</td>`;
      html += `<td>${day}</td>`;
      html += `<td>${clockInShift0}</td>`;
      html += `<td>${clockOutShift0}</td>`;
      html += `<td>${clockInShift1}</td>`;
      html += `<td>${clockOutShift1}</td>`;
      html += '</tr>';
    }
    
    html += '</tbody>';
    html += '</table>';
    html += '</div>';
    html += '</div>';
  
    html += `<div class="w-100 d-flex justify-content-start"><div>Počet odpracovaných hodin: ${workHours}</div></div>`;
    return html;
  }
  
  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    setTimeout(() => {
      modal.remove();
    }, 300);
    currentMonthNav = ""
    currentYearNav = ""
  }

  function deleteUser(userid){
    try {
        window.api.deleteUser(userid)
        console.log("User sucesfully deleted")
        showErrorModal("Uživatel úspěšně odebrán")
        $('#content').load('../view/admin.html');
    } catch (error) {
        showErrorModal("Uživatele se nepodařilo odstranit")
        console.log("Uživatel neodstraněn + " + error)
    }
  }

  function createUser(){
    const modalId = `user-modal-create`;
    let modalHTML = `
    <div class=" d-flex justify-content-center align-items-center">
        <div class="form-group mr-1">
            <label for="name">Jméno</label>
            <input  type="text" class="form-control" id="firstname" placeholder="Jméno">
        </div>
        <div class="form-group ml-1">
            <label for="lastname">Příjmení</label>
            <input  type="text" class="form-control" id="lastname" placeholder="Příjmení">
        </div>
    </div>
    <div class="d-flex justify-content-end">
        <div class="form-group">
            <button id="saveuser" class="btn btn-primary">Uložit</button>
            <button  id="canceluser" class="btn btn-light">Zrušit</button>
        </div>
    </div>
    
    `

    showModal(modalHTML,modalId)

    document.getElementById("saveuser").addEventListener("click", (event)=>{
        let firstname = document.getElementById("firstname").value
        let lastname =document.getElementById("lastname").value

        window.api.createUser(firstname,lastname)
        console.log("Uživatel vytvořen")
        showErrorModal("Uživatel úspěšně přidán")
        $('#content').load('../view/admin.html');
        closeModal(modalId)
    })
    document.getElementById("canceluser").addEventListener("click",(event)=>{
        closeModal(modalId)
    })
  }

  function editUser(userId) {
    const users = window.api.getUsers()
    let user = users.find(user => user.id === userId);
    const modalId = `user-modal-${userId}`;
    let modalHTML = `
    <div class=" d-flex justify-content-center align-items-center">
        <div class="form-group mr-1">
            <label for="name">Jméno</label>
            <input value="${user.firstName}" type="text" class="form-control" id="firstname" placeholder="Jméno">
        </div>
        <div class="form-group ml-1">
            <label for="lastname">Příjmení</label>
            <input value="${user.lastName}" type="text" class="form-control" id="lastname" placeholder="Příjmení">
        </div>
    </div>
    <div class="d-flex justify-content-end">
        <div class="form-group">
            <button id="saveuser" class="btn btn-primary">Uložit</button>
            <button  id="canceluser" class="btn btn-light">Zrušit</button>
        </div>
    </div>
    
    `

    showModal(modalHTML,modalId)

    document.getElementById("saveuser").addEventListener("click", (event)=>{
        let firstname = document.getElementById("firstname").value
        let lastname =document.getElementById("lastname").value

        window.api.saveUser(userId,firstname,lastname)
        console.log("data se uložila")
        $('#content').load('../view/admin.html');
        closeModal(modalId)
    })
    document.getElementById("canceluser").addEventListener("click",(event)=>{
        closeModal(modalId)
    })
  }


     function changePassword(){
    const modalId = `changePasswordId`;
    let modalHTML = `
    <div class=" d-flex  flex-column justify-content-center ">
    <div class="form-group text-center">
    <h3>Změna hesla</h3>
    <h4 class="h4 " style="color:red;" id="errormessage"></h4>
    </div>
        <div class="form-group ">
            <input type="password" class="form-control" id="passwordchk1" placeholder="Heslo">
        </div>
        <div class="form-group ">
            <input  type="password" class="form-control" id="passwordchk2" placeholder="Heslo znovu">
        </div>
    </div>
    <div class="d-flex justify-content-end">
        <div class="form-group">
            <button id="savepass" class="btn btn-primary">Uložit heslo</button>
            <button  id="cancelpass" class="btn btn-light">Zrušit</button>
        </div>
    </div>
    
    `

    showModal(modalHTML,modalId)

    document.getElementById("savepass").addEventListener("click", async (event)=>{
        let passwordchk1 = document.getElementById("passwordchk1").value.toString().trim()
        let passwordchk2 =document.getElementById("passwordchk2").value.toString().trim()
        let errors = document.getElementById("errormessage")
        if(passwordchk1 === "" || passwordchk2 === "" ){
            errors.innerHTML = "Vyplňtě všechna pole"
            return
        }
        if(passwordchk1 !== passwordchk2){
            errors.innerHTML = "Hesla se neschodují"
            return
        }
        if(passwordchk1.length < 5){
            errors.innerHTML = "Heslo musí obsahovat alespoň 5 znaků"
            return
        }
        if(passwordchk1.length > 20){
            errors.innerHTML = "Heslo nesmí obsahovat vicé jak 20 znaků"
            return
        }
        
        if(window.api.savePassword(passwordchk1)){
            showErrorModal("Heslo úspěšně změněno")
        }
        
        $('#content').load('../view/admin.html');
        closeModal(modalId)
    })
    document.getElementById("cancelpass").addEventListener("click",(event)=>{
        closeModal(modalId)
    })
  }
