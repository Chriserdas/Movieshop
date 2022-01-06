const { app, BrowserWindow,screen, } = require('electron');
const { ipcMain } = require('electron');

const path = require('path');




app.on('ready',()=>{
    const primaryDisplay = screen.getPrimaryDisplay();
    const {width,height} = primaryDisplay.workAreaSize;

    var win = new BrowserWindow({
        webPreferences:{ 
            enableRemoteModule: true,
            webSecurity:false,
            nodeIntegration: true,
            contextIsolation: false
        },
        width,height,
        frame: false,
        titleBarStyle: 'customButtonsOnHover',
        
    });
    
    win.loadFile('../html/index.html');
    


    ipcMain.on('close_app',(_event,arg)=>{
        app.quit();
    });

    ipcMain.on('maximize_app',(_event,_arg)=>{

        if(win.isMaximized()){
            win.unmaximize();
        }

        else win.maximize();

    });

    ipcMain.on('minimize_app',(_event,_arg)=>{
        win.minimize();
    });
});

  
app.on('window-all-closed', () => {
    app.quit()
})

