const { app, BrowserWindow,screen, } = require('electron');
const path = require('path');

function createWindow () {
    const primaryDisplay = screen.getPrimaryDisplay();
    const {width,height} = primaryDisplay.workAreaSize

    const win = new BrowserWindow({
        width,height,
        frame: false,
        titleBarStyle: 'customButtonsOnHover'
    });

    const loginWindow = new BrowserWindow({
        parent: win,
        width:800,
        height:400,
        frame:false
    });

    win.loadFile('../html/index.html');
    loginWindow.loadFile('../html/login.html');
}


app.whenReady().then(() => {
    createWindow()
  
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})
  
app.on('window-all-closed', () => {
    app.quit()
})
  