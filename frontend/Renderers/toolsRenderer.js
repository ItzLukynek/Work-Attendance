$(document).ready(()=>{
  loadtable();
  searchBar()
});

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
          <td><a href="#" onclick="showMoreInfo(${user.id})"><div class="info-icon"><i class="fas fa-info"></i></div></a></td>
        </tr>
      `;
    });
    
    html += `
        </tbody>
      </table>
    `;
    
    usertable.innerHTML = html;
  }

  
  
  