const {BrowserWindow,app} = require('electron');
const path = require('path');


const createWindow = () =>{
    const win = new BrowserWindow({
        frame:false,
        webPreferences: {
            preload: path.join(__dirname, '../backend/Preload/indexPreload.js'),
            sandbox: false,
            contextIsolation:true
        },
    });
    
    win.setMenu(null);
    win.loadFile("../frontend/view/index.html")
    win.maximize();
    win.webContents.openDevTools()
    
}

app.whenReady().then(() =>{
    createWindow();
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })