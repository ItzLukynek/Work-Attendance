const { contextBridge,ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const bcrypt = require('bcrypt');
//get data from users.json
function getUsers() {
  try {
    const rawData = fs.readFileSync(path.join(__dirname, '../json/users.json'));
    let users = JSON.parse(rawData);
    return users;
  } catch (error) {
    showErrorModal(error);
    return null;
  }
}

//get data from timelog.json
function getTimelog() {
  try {
    const rawData = fs.readFileSync(path.join(__dirname, '../json/timelog.json'));
    return JSON.parse(rawData);
  } catch (error) {
    showErrorModal(error);
    return null;
  }
}

async function hashPassword(password) {
  try {
    // Generate a salt to use for hashing
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);

  // Hash the password using the salt
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
  } catch (error) {
    console.log(error);
  }
}
async function savePassword(password) {
  try {
    let config = JSON.parse(fs.readFileSync(path.join(__dirname, '../json/config.json')));
    config[0].key = await hashPassword(password);
    fs.writeFileSync(path.join(__dirname, '../json/config.json'), JSON.stringify(config));
  } catch (error) {
    console.log(error);
  }
}
async function verifyPassword(password) {
  try {
    let config = JSON.parse(fs.readFileSync(path.join(__dirname, '../json/config.json')));
    const hashedPassword = config[0].key;

    // Compare the user's input with the hashed password
    const passwordMatches = await bcrypt.compare(password, hashedPassword);
    console.log(passwordMatches)
    if (passwordMatches) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
  }
}

function clockIn(userId) {
  const today = moment().format('YYYY-MM-DD');
  let timeLog = require('../json/timelog.json');
  let info = false;

  // Find today's entry or create a new one
  let dayEntry = timeLog.find(entry => entry.date === today);
  if (!dayEntry) {
    dayEntry = {
      date: today,
      users: []
    };
    timeLog.push(dayEntry);
  }

  const userEntry = dayEntry.users.find(entry => entry.id === userId);

  // Check if user is already clocked in for shift0
  if (userEntry && userEntry.shift0.clockedin && userEntry.shift0.clockedout) {
    // Clock in for shift1
    if (userEntry.shift1.clockedin) {
      window.postMessage({ type: 'USER_ALREADY_CLOCKED_IN', text: 'User is already clocked in for both shifts', clockin: userEntry.shift1.clockedin });
      console.log('User is already clocked in for both shifts');
      return;
    }

    userEntry.shift1.clockedin = moment().format('YYYY-MM-DD HH:mm:ss');
    window.postMessage({ type: 'USER_CLOCKED_IN', text: 'User clocked in for shift1 successfully' });
    console.log('User clocked in for shift1 successfully');
    info = true;
  } else {
    // Clock in for shift0
    if (userEntry) {
      window.postMessage({ type: 'USER_ALREADY_CLOCKED_IN', text: 'User is already clocked in for shift0', clockin: userEntry.shift0.clockedin });
      console.log('User is already clocked in for shift0');
      return;
    }

    dayEntry.users.push({
      id: userId,
      shift0: {
        clockedin: moment().format('YYYY-MM-DD HH:mm:ss'),
        clockedout: ''
      },
      shift1: {
        clockedin: '',
        clockedout: ''
      }
    });
    window.postMessage({ type: 'USER_CLOCKED_IN', text: 'User clocked in for shift0 successfully' });
    console.log('User clocked in for shift0 successfully');
  }

  fs.writeFileSync(path.join(__dirname, '../json/timelog.json'), JSON.stringify(timeLog));
  return info;
}


function clockOut(userId) {
  const today = moment().format('YYYY-MM-DD');
  let timeLog = require('../json/timelog.json');
  let info = false;

  let dayEntry = timeLog.find(entry => entry.date === today);
  if (!dayEntry) {
    window.postMessage({ type: 'USER_NOT_CLOCKED_IN', text: 'User is not clocked in for today' });
    console.log('User is not clocked in for today');
    return;
  }

  const userEntry = dayEntry.users.find(entry => entry.id === userId);
  if (!userEntry) {
    window.postMessage({ type: 'USER_NOT_CLOCKED_IN', text: 'User is not clocked in for today' });
    console.log('User is not clocked in for today');
    return;
  } else if (userEntry.shift0.clockedout && userEntry.shift1.clockedout) {
    window.postMessage({ type: 'USER_ALREADY_CLOCKED_OUT', text: 'User is already clocked out for today', clockout: userEntry.shift1.clockedout });
    console.log('User is already clocked out for today');
    return;
  } else {
    if (!userEntry.shift0.clockedout) {
      userEntry.shift0.clockedout = moment().format('YYYY-MM-DD HH:mm:ss');
    } else {
      userEntry.shift1.clockedout = moment().format('YYYY-MM-DD HH:mm:ss');
      info = true;
    }

    window.postMessage({ type: 'USER_CLOCKED_OUT', text: 'User clocked out successfully' });
    console.log('User clocked out successfully');
  }

  fs.writeFileSync(path.join(__dirname, '../json/timelog.json'), JSON.stringify(timeLog));
  return info;
}



async function saveProfilePhoto(userId, file){
  const filePath = path.join(__dirname, `../../public/Images/ProfileImages/${userId}.jpg`);
  try {
    const fileContents = await fs.promises.readFile(file.path);
    await fs.promises.writeFile(filePath, fileContents);
    return filePath;
  } catch (error) {
    console.error(error);
    return null;
  }
}
function saveUserUrl(userid, url) {
  let userss = getUsers()
  userss.forEach(user => {
    if(user.id === userid) {
      user.photo = url
    }
  });
  fs.writeFileSync(path.join(__dirname, '../json/users.json'), JSON.stringify(userss));

}

  //api for functions
  contextBridge.exposeInMainWorld('api', {
    //get users
    getUsers: () => getUsers(),
    //controls
    minimize: () => {
      ipcRenderer.send('window-minimize')
    },
    close: () => {
      ipcRenderer.send('window-close')
    },
    clockIn: (userid) => clockIn(userid),
    clockOut: (userid) => clockOut(userid),
    getTimelog: () => getTimelog(),
    saveProfilePicture: async (userid, file) => saveProfilePhoto(userid, file),
    saveUserUrl:(userid, url) => saveUserUrl(userid, url) ,
    //pasword methods
    verifyPassword:(password) => verifyPassword(password),
    savePassword: (password) => savePassword(password),
    hashPassword: (password) => hashPassword(password),
  });


