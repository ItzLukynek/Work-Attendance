$(document).ready(()=>{
  loadtable();
  searchBar()
});
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
    const isSpecialDay = day === 'so' || day === 'ne'; // Check if day is "so" or "ne"

    if (i === 16) {
      html += '</tbody></table></div><div><table class="ml-2"><thead><tr><th>Datum</th><th>Den</th><th>Příchod</th><th>Odchod</th><th>Příchod</th><th>Odchod</th></tr></thead>'
      html += '<tbody>';
    }

    // Add CSS class for special days
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
}
function showUserSettings(userId) {
  const users = window.api.getUsers();
  let user = users.find(user => user.id === userId);
  const modalId = `user-modal-${userId}`;
  const modalHtml = `
    <div class="toolmodal active" id="${modalId}">
      <div class="toolmodal-background"></div>
      <div class="toolmodal-content">
        <h2 class="mb-3">${user.firstName} ${user.lastName}</h2>
        <form class="">
          <div class="d-flex justify-content-center">
          <label for="profile-picture">Vybrat fotku: </label>
          <input class="ml-2 mr-2" type="file" id="profile-picture" accept="image/*">
          </div>
          <div class="d-flex flex-row justify-content-end">
          <button type="submit" class="btn mr-1 btn-primary mt-4">Uložit</button>
          <button class="btn mt-4 btn-light" ml-1 onclick="closeModal('${modalId}')">Zavřít</button></div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modal = document.getElementById(modalId);
  const modalBackground = modal.querySelector('.toolmodal-background');

  modalBackground.addEventListener('click', (event) => {
    closeModal(modalId);
  });

  const form = modal.querySelector('form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fileInput = form.querySelector('#profile-picture');
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const filePath = await window.api.saveProfilePicture(userId, file);
      if (filePath) {
        let url = "../../public/Images/ProfileImages/"+ userId + ".jpg";
        window.api.saveUserUrl(userId,url);
        closeModal(modalId);
      }
    }
  });
}

function prevMonth(userId,month,year){
  let usermonth = generateClockInAndOutTable(userId , month, year);

  document.getElementById("usermonth").innerHTML = usermonth;
  document.getElementById("prevMonth").disabled = true;
}

function showMoreInfo(userId) {
  const users = window.api.getUsers();
  let user = users.find(user => user.id === userId);
  const modalId = `user-modal-${userId}`;
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // add 1 to get 1-12 instead of 0-11
  const monthName = getMonthName(currentMonth);
  let usermonth = generateClockInAndOutTable(userId , currentMonth, currentYear);
  let lastmonth = currentMonth - 1;
  let curYear = currentYear
  if(currentMonth === 0){
    curYear = currentYear - 1;
    lastmonth = 11;
  }

  const modalHtml = `
    <div class="toolmodal active" id="${modalId}">
      <div class="toolmodal-background"></div>
      <div class="toolmodal-content">
        <div class='text-center'>
        <h2>${user.firstName} ${user.lastName}</h2>
        <h4>${monthName}</h4>
        </div>
        <div id="usermonth">${usermonth}</div>
        <div class="d-flex flex-row justify-content-end">
        <button id="prevMonth" class="btn btn-primary mr-2" onclick="prevMonth(${userId},${lastmonth},${curYear})">Zobrazit předchozí měsíc</button>
        <button class="btn btn-light mr-3" onclick="closeModal('${modalId}')">Zavřít</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modal = document.getElementById(modalId);
  const modalBackground = modal.querySelector('.toolmodal-background');

  modalBackground.addEventListener('click', (event) => {
    closeModal(modalId);
  });
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
          <td><div  class="flex-row d-flex"><a href="#" onclick="showMoreInfo(${user.id})"><div class="info-icon bg-primary"><i class="fas fa-info"></i></div></a><a href="#" onclick="showUserSettings(${user.id})"><div class="info-icon bg-primary"><i class="fa-solid fa-image"></i></div></a></div></td>
          
        </tr>
      `;
    });
    
    html += `
        </tbody>
      </table>
    `;
    
    usertable.innerHTML = html;
  }

  function getMonthName(month, short = false) {
    const options = short ? { month: 'short' } : { month: 'long' };
    return new Intl.DateTimeFormat('cs-CZ', options).format(new Date(2022, month, 1));
  }

  
  
  