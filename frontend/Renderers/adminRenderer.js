

$(document).ready(async () =>{
    loadtable();
    searchBar()
    files();
    document.getElementById("addUser").addEventListener("click",(event)=>{
        createUser()
    })
    document.getElementById("changePassword").addEventListener("click",(event)=>{
        changePassword()
    })
   
  
    // Populate yearSelect
    populateYearSelect();
    
  });

async function files(){
  const userSelect = document.getElementById('userSelect');
  const monthSelect = document.getElementById('monthSelect');
  const yearSelect = document.getElementById('yearSelect');
  const exportForm = document.getElementById('exportForm');

  // Fetch users and populate the user select dropdown
  const users = await window.api.getUsers();
  users.forEach((user) => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = `${user.firstName} ${user.lastName}`;
    userSelect.appendChild(option);
  });

  // Get the current year and populate the year select dropdown
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= currentYear - 10; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }

  // Define the months array
  const months = [
    "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
    "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"
  ];

  // Populate the month select dropdown
  months.forEach((month, index) => {
    const option = document.createElement('option');
    option.value = index + 1;
    option.textContent = month;
    monthSelect.appendChild(option);
  });

  exportForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const selectedUserId = parseInt(userSelect.value);
    const selectedMonth = parseInt(monthSelect.value);
    const selectedYear = parseInt(yearSelect.value);

    // Call the corresponding export functions based on the selected options
    if (event.submitter.id === 'button1') {
      await exportDataForChosenUser(selectedUserId, selectedMonth, selectedYear);
    } else if (event.submitter.id === 'button2') {
      await exportDataForOneMonth(selectedMonth, selectedYear, 'csv', 'local');
    } else if (event.submitter.id === 'button3') {
      await exportDataForOneMonth(selectedMonth, selectedYear, 'csv', 'choose');
    } else if (event.submitter.id === 'button4') {
      await exportDataForOneYear(selectedUserId, selectedYear, 'excel', 'local');
    } else if (event.submitter.id === 'button5') {
      await exportDataForOneYear(selectedUserId, selectedYear, 'excel', 'choose');
    }
  });
}
async function exportDataForChosenUser(userId, month, year) {
  const data = await window.api.getTimelog();

  // Filter data for the selected user and month
  const filteredData = data.filter((entry) => {
    const entryDate = new Date(entry.date);
    return (
      entryDate.getFullYear() === year &&
      entryDate.getMonth() === month - 1 &&
      entry.users.some((user) => user.id === userId)
    );
  });

  let sheetData = [];
  let users = window.api.getUsers();
  let user = users.find((user) => user.id === userId);
  const name = user.firstName + ' ' + user.lastName;
  const nameRow = [name, '', '', '', '','','',''];
  sheetData.push(nameRow);
  const headers = ['Datum', ' Dop ', ' Dop ', ' Odp ', ' Odp ',' Hod. ', ' Dov.',' Sv.'];
  sheetData.push(headers);

  // Helper function to format time as 'HH:mm' (hours and minutes) or '-'
  function formatTime(dateTime) {
    if (!dateTime) return '-';
    const d = new Date(dateTime);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Calculate the number of days in the selected month
  const lastDayOfMonth = new Date(year, month, 0).getDate();

  // Generate data for all days of the selected month
  for (let day = 1; day <= lastDayOfMonth; day++) {
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const entry = filteredData.find((entry) => entry.date === dateString);
    const formatedDate = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
    let data_array = []
    let dayWorkTime = 0;
    
    if(entry?.users[0]?.shift0 && entry.users[0].shift0.clockedin !== "" && entry.users[0].shift0.clockedout !== ""){
      data_array.push({
        'clockedin': entry.users[0].shift0.clockedin,
        'clockedout':entry.users[0].shift0.clockedout
      })
    }
    if(entry?.users[0]?.shift1 && entry.users[0].shift1.clockedin !== "" && entry.users[0].shift1.clockedout !== ""){
      data_array.push({
        'clockedin': entry.users[0].shift1.clockedin,
        'clockedout':entry.users[0].shift1.clockedout
      })
    }

    
    
    if(data_array.length > 0){
      dayWorkTime= calculateOneDayTime(data_array);
    }
    console.log(dayWorkTime);
    const row = [
      dateString,
      entry?.users[0]?.shift0 ? formatTime(entry.users[0].shift0.clockedin) : '-',
      entry?.users[0]?.shift0 ? formatTime(entry.users[0].shift0.clockedout) : '-',
      entry?.users[0]?.shift1 ? formatTime(entry.users[0].shift1.clockedin) : '-',
      entry?.users[0]?.shift1 ? formatTime(entry.users[0].shift1.clockedout) : '-',
      dayWorkTime,
    ];
    sheetData.push(row);


  }
 sheetData.push(['','','','','','Celk. H','Celk. H']);

  const filename = `export_chosen_user_${userId}_${month}_${year}`;
  await window.api.exportDataToCSVOneUserMonth(sheetData, filename);

}
function calculateOneDayTime(data) {
  let totalWorkTime = 0;
  for (let index = 0; index < data.length; index++) {
    // Round clockedin to the nearest quarter-hour
    const roundedClockedin = new Date(data[index].clockedin);
    roundedClockedin.setMinutes(Math.ceil(roundedClockedin.getMinutes() / 15) * 15);

    // Round clockedout down to the previous quarter-hour
    const roundedClockedout = new Date(data[index].clockedout);
    roundedClockedout.setMinutes(Math.floor(roundedClockedout.getMinutes() / 15) * 15);

    // Calculate work time using rounded times
    const workTime = roundedClockedout - roundedClockedin;
    if (workTime > 0) {
      totalWorkTime += workTime;
    }
  }
  return parseFloat((totalWorkTime / 3600000).toFixed(2)); // Divide by 3600000 to get the work time in hours
}


async function exportDataForOneMonth(month, year, type, pathType) {
  const data = await window.api.getTimelog();
  const filteredData = data.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === month - 1 && entryDate.getFullYear() === year;
  });

  if (filteredData.length === 0) {
    alert('No data found for the selected month and year.');
    return;
  }

  const filename = `export_one_month_${month}_${year}`;
  if (pathType === 'local') {
    await window.api.exportDataToCSV(filteredData, filename);
  } else if (pathType === 'choose') {
    showSaveDialog(null, { type, data: filteredData, filename });
  }
}

async function exportDataForOneYear(userId, year, type, pathType) {
  const data = await window.api.getTimelog();
  const filteredData = data.filter((entry) => {
    const entryDate = new Date(entry.date);
    return (
      entryDate.getFullYear() === year &&
      entry.users.some((user) => user.id === userId)
    );
  });

  if (filteredData.length === 0) {
    alert('No data found for the selected user and year.');
    return;
  }

  const filename = `export_one_year_${userId}_${year}`;
  if (pathType === 'local') {
    await window.api.exportDataToExcel(filteredData, filename);
  } else if (pathType === 'choose') {
    showSaveDialog(null, { type, data: filteredData, filename });
  }
}
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


  //File managment 
  
    // Function to populate the userSelect element
    function populateUserSelect(users) {
      const userSelect = document.getElementById('userSelect');
      for (const user of users) {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.firstName} ${user.lastName}`;
        userSelect.appendChild(option);
      }
    }
  
    // Function to populate the yearSelect element with the last 10 years
    function populateYearSelect() {
      const yearSelect = document.getElementById('yearSelect');
      const currentYear = new Date().getFullYear();
      for (let year = currentYear; year >= currentYear - 10; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      }
    }
  
    // Call the API to get user data from the main process
    

