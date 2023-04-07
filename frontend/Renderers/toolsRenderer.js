$(document).ready(()=>{
  loadtable();
  searchBar()
});
//setings for the user 
function getClockInAndOutTimes(userId, month, year) {
     
    const timelogData = window.api.getTimelog();
  
    // Filter the data to get only the entries for the specified user and month
    const userTimelogEntries = timelogData.filter((entry) => {
      const date = new Date(entry.date);
      return entry.users.some((user) => user.id === userId) &&
        date.getMonth() === month &&
        date.getFullYear() === year;
    });
  
    // Create an object that maps each date to the corresponding clock in and out times
    const clockInAndOutTimes = {};
    userTimelogEntries.forEach((entry) => {
      const date = new Date(entry.date);
      entry.users.forEach((user) => {
        if (user.id === userId && user.clockedin && user.clockedout) {
          const clockInTime = new Date(user.clockedin);
          const clockOutTime = new Date(user.clockedout);
          clockInAndOutTimes[date.getDate()] = {
            clockIn: formatTime(clockInTime),
            clockOut: formatTime(clockOutTime)
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
    return `${hours}:${minutes}:${seconds}`;
  }
  
  function generateClockInAndOutTable(userId, month, year) {
    // Get the clock in and out times for the user and month
    const clockInAndOutTimes = getClockInAndOutTimes(userId, month, year);
  
    // Create the HTML table
    let html = '<div class="mt-3 mb-3 clockinout-table d-flex flex-row">\n';

  
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    html += '<div class="d-flex flex-column">'
    html += '<div class="d-flex flex-row"><div>Datum</div><div>Den</div><div>Příchod</div><div>Odchod</div></div>'
    for (let i = 1; i <= daysInMonth; i++) {
      const dateCell = `<div>${i}. ${getMonthName(month, true)}</div>`;
      const dayCell = `<div>${new Intl.DateTimeFormat('cs-CZ', { weekday: 'short' }).format(new Date(year, month, i))}</div>`;
      const clockInCell = `<div>${clockInAndOutTimes[i]?.clockIn || '-'}</div>`;
      const clockOutCell = `<div>${clockInAndOutTimes[i]?.clockOut || '-'}</div>`;
      const row = `<div class="d-flex flex-row">${dateCell}${dayCell}${clockInCell}${clockOutCell}</div>\n`;
  
      if (i == 16) {
        html += '</div><div style="border-left:2px solid black;" class="d-flex flex-column">'
        html += '<div class="d-flex flex-row"><div>Datum</div><div>Den</div><div>Příchod</div><div>Odchod</div></div>'
      }
      html += row
    }

    html += '</div>'
    html += '</div>'
    console.log(html);
    return html;
  }
  
  function getMonthName(month, short = false) {
    const options = short ? { month: 'short' } : { month: 'long' };
    return new Intl.DateTimeFormat('cs-CZ', options).format(new Date(2022, month, 1));
  }
  
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('active');
  setTimeout(() => {
    modal.remove();
  }, 300);
}

function showMoreInfo(userId) {
  const users = window.api.getUsers();
  let user = users.find(user => user.id === userId);
  const modalId = `user-modal-${userId}`;
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // add 1 to get 1-12 instead of 0-11
  let usermonth = generateClockInAndOutTable(userId , currentMonth, currentYear);

  const modalHtml = `
    <div class="toolmodal active" id="${modalId}">
      <div class="toolmodal-background"></div>
      <div class="toolmodal-content">
        <h2>${user.firstName} ${user.lastName}</h2>
        <div>${usermonth}</div>
        <button class="btn btn-light" onclick="closeModal('${modalId}')">Close</button>
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
          <td><a href="#" onclick="showMoreInfo(${user.id})"><div class="info-icon bg-primary"><i class="fas fa-info"></i></div></a></td>
        </tr>
      `;
    });
    
    html += `
        </tbody>
      </table>
    `;
    
    usertable.innerHTML = html;
  }


  
  
  