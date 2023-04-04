const {BrowserWindow,app,ipcMain} = require('electron');
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
  
scheduleNewDay(); // Start the scheduling

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })


