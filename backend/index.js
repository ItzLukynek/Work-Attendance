const {BrowserWindow,app,ipcMain,dialog} = require('electron');
const path = require('path');
const moment = require('moment');
const fs = require('fs');
const localShortcut = require('electron-localshortcut')


let mainWindow 
const createWindow = () =>{
     mainWindow = new BrowserWindow({
        frame:false,
        webPreferences: {
            preload: path.join(__dirname, 'Preload/indexPreload.js'),
            sandbox: false,
            contextIsolation:true,
            nodeIntegration: false
        },
    });
    
    mainWindow.setMenu(null);
    mainWindow.loadFile("../frontend/view/index.html")
    mainWindow.maximize();

    // Register the F12 shortcut to open the DevTools
    localShortcut.register(mainWindow, 'Ctrl+F12', () => {
        mainWindow.webContents.openDevTools()
    })

    
}

app.whenReady().then(() =>{
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow()
        }
      })

    ipcMain.on('window-minimize', () => {
    mainWindow.minimize()
    })
    
    ipcMain.on('window-close', () => {
        console.log('Received window-close event');
    mainWindow.close()
    })
    
})
//refresh the page and data
function newDay() {
    const today = moment().format('YYYY-MM-DD');
    let timeLog = JSON.parse(fs.readFileSync(path.join(__dirname, '../backend/json/timelog.json')));
    let day = {
        date: today,
        users: []
    };
    timeLog.push(day);
    fs.writeFileSync(path.join(__dirname, '../backend/json/timelog.json'), JSON.stringify(timeLog));
    
}
  
function scheduleNewDay() {
    const now = new Date();
    const millisUntilMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // Tomorrow
      0, // Midnight hours
      0, // Midnight minutes
      0 // Midnight seconds
    ) - now;
    setTimeout(() => {
      newDay();
      scheduleNewDay(); // Schedule the task again for the next midnight
    }, millisUntilMidnight);
}

function lunchTimelog() {
  const timelog = fs.readFileSync(path.join(__dirname, '../backend/json/timelog.json'));
  let timelogData = JSON.parse(timelog);
  const now = new Date();
  const today = moment().format('YYYY-MM-DD');

  const currentDayIndex = timelogData.findIndex(day => day.date === today);

  if (currentDayIndex !== -1) {
    const currentDay = timelogData[currentDayIndex];
    currentDay.users.forEach(user => {
      const shift0ClockedIn = new Date(user.shift0.clockedin);
      const shift0ClockedOut = new Date(user.shift0.clockedout);
      const shift1ClockedIn = new Date(user.shift1.clockedin);

      if (shift0ClockedIn !== "") {
        // User clocked in during shift0
        const shift0ClockedOutLunch = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          12, // Lunch clocked out hours
          15, // Lunch clocked out minutes
          0 // Lunch clocked out seconds
        );
        const shift1ClockedInLunch = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          12, // Lunch clocked in hours
          45, // Lunch clocked in minutes
          0 // Lunch clocked in seconds
        );

        if (now >= shift0ClockedOutLunch && now < shift1ClockedIn) {
          // User clocked in between 12:15 and 12:45
          user.shift0.clockedin = "";
          user.shift0.clockedout = "";
          user.shift1.clockedin = moment(shift1ClockedInLunch).format('YYYY-MM-DD HH:mm:ss'); // Set shift1 clocked in to 12:45
        } else {
          user.shift0.clockedout = moment(shift0ClockedOutLunch).format('YYYY-MM-DD HH:mm:ss');
          user.shift1.clockedin = moment(shift1ClockedInLunch).format('YYYY-MM-DD HH:mm:ss');
        }
      }
    });

    timelogData[currentDayIndex] = currentDay;
    fs.writeFileSync(path.join(__dirname, '../backend/json/timelog.json'), JSON.stringify(timelogData, null, 2));
    
    mainWindow.webContents.send('lunch-reload','lunch-finished');
   
  }
}
function MorningTimelog() {
  const timelog = fs.readFileSync(path.join(__dirname, '../backend/json/timelog.json'));
  let timelogData = JSON.parse(timelog);
  const now = new Date();
  const today = moment().format('YYYY-MM-DD');

  const currentDayIndex = timelogData.findIndex(day => day.date === today);

  if (currentDayIndex !== -1) {
    const currentDay = timelogData[currentDayIndex];
    currentDay.users.forEach(user => {
      const shift0ClockedIn = new Date(user.shift0.clockedin);

      if (shift0ClockedIn !== "") {
        const shift1ClockedInWork = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          8, // Work clocked in hours
          30, // Work clocked in minutes
          0 // Work clocked in seconds
        );

        if (now >= shift1ClockedInWork) {
          // User clocked in after 8:30
          user.shift0.clockedin = moment(shift1ClockedInWork).format('YYYY-MM-DD HH:mm:ss');
        }
      }
    });

    timelogData[currentDayIndex] = currentDay;
    fs.writeFileSync(path.join(__dirname, '../backend/json/timelog.json'), JSON.stringify(timelogData, null, 2));

    mainWindow.webContents.send('morning-reload', 'morning-finished');
  }
}
function MorningReload() {
  const now = new Date();
  const lunchTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    8, // 12 PM
    30, // 45 minutes
    0 // 0 seconds
  );

  // Check if the current time is already past 12:45 PM
  if (now > lunchTime) {
    lunchTime.setDate(lunchTime.getDate() + 1); // Set to the next day
  }

  const millisUntilLunch = lunchTime - now;
  setTimeout(() => {
    MorningTimelog();
  }, millisUntilLunch);
}
MorningReload();
//for work
function lunchReload() {
  const now = new Date();
  const lunchTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    12, // 12 PM
    45, // 45 minutes
    0 // 0 seconds
  );

  // Check if the current time is already past 12:45 PM
  if (now > lunchTime) {
    lunchTime.setDate(lunchTime.getDate() + 1); // Set to the next day
  }

  const millisUntilLunch = lunchTime - now;
  setTimeout(() => {
    lunchTimelog();
  }, millisUntilLunch);
}

lunchReload();
scheduleNewDay(); // Start the scheduling

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  ipcMain.handle('get-user-data', (event) => {
    // Read JSON data from the file (adjust the file path accordingly)
    const filePath = path.join(__dirname, '../backend/json/users.json');
    try {
      const jsonData = fs.readFileSync(filePath, 'utf-8');
      const users = JSON.parse(jsonData);
      return users;
    } catch (error) {
      console.error('Error reading user data:', error);
      return [];
    }
  });

  ipcMain.on('export-to-csv', (event, { excelBuffer, filename }) => {
    const options = {
      title: 'Export Excel',
      defaultPath: path.join(app.getPath('downloads'), filename + '.xlsx'),
      filters: [{ name: 'Excel Files', extensions: ['xlsx'] }],
    };
  
    dialog.showSaveDialog(options).then((result) => {
      if (!result.canceled && result.filePath) {
        fs.writeFile(result.filePath, excelBuffer, (err) => {
          if (err) {
            console.error('Error writing Excel file:', err);
          }
        });
      }
    });
  });
  
 
  async function showSaveDialog(event, { type, data, filename }) {
    const options = {
      title: `Export ${type === 'csv' ? 'CSV' : 'Excel'}`,
      defaultPath: filename + (type === 'csv' ? '.csv' : '.xlsx'),
      filters: [{ name: `${type === 'csv' ? 'CSV' : 'Excel'} Files`, extensions: [type] }],
    };
  
    try {
      const result = await dialog.showSaveDialog(mainWindow, options);
      if (!result.canceled && result.filePath) {
        fs.writeFile(result.filePath, data, (err) => {
          if (err) {
            console.error(`Error writing ${type} file:`, err);
          }
        });
      }
    } catch (error) {
      console.error('Error showing save dialog:', error);
    }
  }
