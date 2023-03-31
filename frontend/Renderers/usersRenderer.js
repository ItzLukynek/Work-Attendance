const userroot = document.getElementById('userroot');


 function getUsers() {
    try {
        let userD = window.api.getUsers();
        
        return userD;
    } catch (err) {
        console.error(err);
        return null;
    }
}


function renderUsersPage(){
    let users = getUsers();
    console.log(users);
    let html = '';
    users.forEach(user => {
        let name = user.firstName +" "+ user.lastName;
        html +=`
        <div class="card  bg-dark text-white">
        <div class="card-body d-flex flex-column align-items-center">
            <h5 class="card-title">${name}</h5>
            <p class="card-text">Clock in or out for ${name}</p>
            <div class="d-grid gap-2">
            <button class="btn btn-primary" type="button">Clock In</button>
            <button class="btn btn-secondary" type="button">Clock Out</button>
            </div>
        </div>
        </div>
      `
    });
    userroot.innerHTML = html;
}

document.addEventListener('DOMContentLoad',renderUsersPage());


