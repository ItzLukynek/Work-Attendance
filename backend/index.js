const {BrowserWindow,app,ipcMain} = require('electron');
const path = require('path');

let mainWindow ;
const createWindow = () =>{
     mainWindow = new BrowserWindow({
        frame:false,
        webPreferences: {
            preload: path.join(__dirname, 'Preload/indexPreload.js'),
            sandbox: false,
            contextIsolation:true
        },
    });
    
    mainWindow.setMenu(null);
    mainWindow.loadFile("../frontend/view/index.html")
    mainWindow.maximize();
    mainWindow.webContents.openDevTools()
    
}

app.whenReady().then(() =>{
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow()
        }
      })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

ipcMain.on('window-minimize', () => {
mainWindow.minimize()
})

ipcMain.on('window-maximize', () => {
mainWindow.maximize()
})

ipcMain.on('window-close', () => {
mainWindow.close()
})

