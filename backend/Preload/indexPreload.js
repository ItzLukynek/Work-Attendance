const { contextBridge,ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

//get data from users.json
function getUsers() {
  try {
    const rawData = fs.readFileSync(path.join(__dirname, '../json/users.json'));
    let users = JSON.parse(rawData);
    return users.users;
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
//clocking in and out

// Clock in the current user for today
function clockIn(userId) {
  const today = moment().format('YYYY-MM-DD');
  let timeLog = JSON.parse(fs.readFileSync(path.join(__dirname, '../json/timelog.json')));

  let dayEntry = timeLog.find(entry => entry.date === today);
  if (!dayEntry) {
    dayEntry = {
      date: today,
      users: []
    };
    timeLog.push(dayEntry);
  }

  const userEntry = dayEntry.users.find(entry => entry.id === userId);
  if (userEntry) {
    let user;
    for (let i = 0; i < dayEntry.users.length; i++) {
      if (dayEntry.users[i].id === userId) {
        user = dayEntry.users[i];
        break;
      }
    }
    window.postMessage({ type: 'USER_ALREADY_CLOCKED_IN', text: 'User is already clocked in for today' , clockin: user.clockedin});
    console.log('User is already clocked in for today');
  } else {
    dayEntry.users.push({
      id: userId,
      clockedin: moment().format('YYYY-MM-DD HH:mm:ss'),
      clockedout: ''
    });
    const updatedTimeLog = timeLog.map(entry => {
      if (entry.date === today) {
        return dayEntry;
      } else {
        return entry;
      }
    });
    fs.writeFileSync(path.join(__dirname, '../json/timelog.json'), JSON.stringify(updatedTimeLog));
    window.postMessage({ type: 'USER_CLOCKED_IN', text: 'User clocked in successfully'});
    console.log('User clocked in successfully')
  }
}
function clockOut(userId) {
  const today = moment().format('YYYY-MM-DD');
  let timeLog = JSON.parse(fs.readFileSync(path.join(__dirname, '../json/timelog.json')));

  let dayEntry = timeLog.find(entry => entry.date === today);
  if (!dayEntry) {
    // If no entry exists for today, log an error and return
    window.postMessage({ type: 'USER_NOT_CLOCKED_IN', text: 'User is not clocked in for today' });
    console.log('User is not clocked in for today');
    return;
  }

  const userEntry = dayEntry.users.find(entry => entry.id === userId);
  if (!userEntry) {
    // If no entry exists for the user in today's log, log an error and return
    window.postMessage({ type: 'USER_NOT_CLOCKED_IN', text: 'User is not clocked in for today' });
    console.log('User is not clocked in for today');
    return;
  } else if (userEntry.clockedout) {
    // If the user has already clocked out, log an error and return
    window.postMessage({ type: 'USER_ALREADY_CLOCKED_OUT', text: 'User is already clocked out for today', clockout: userEntry.clockedout });
    console.log('User is already clocked out for today');
    return;
  } else {
    userEntry.clockedout = moment().format('YYYY-MM-DD HH:mm:ss');
    const updatedTimeLog = timeLog.map(entry => {
      if (entry.date === today) {
        return dayEntry;
      } else {
        return entry;
      }
    });
    fs.writeFileSync(path.join(__dirname, '../json/timelog.json'), JSON.stringify(updatedTimeLog));
    window.postMessage({ type: 'USER_CLOCKED_OUT', text: 'User clocked out successfully' });
    console.log('User clocked out successfully');
  }
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
    //clocking in and out
    clockIn: (userid) => clockIn(userid),
    clockOut: (userid) => clockOut(userid),
    getTimelog: () => getTimelog()

    
  });


