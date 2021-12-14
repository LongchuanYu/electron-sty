// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Menu, Tray} = require('electron')
const { exec, spawn, execFile } = require('child_process');
const path = require('path');
const { setDefaultResultOrder } = require('dns');

let mainWindow
let logWindow
let backend

function createWindow () {
  // create the log window.
  // logWindow = new BrowserWindow({
  //   width: 800,
  //   height: 600,
  //   webPreferences: {
  //     nodeIntegration: true,
  //     contextIsolation: false,
  //   }
  // });
  // logWindow.loadFile('log/index.html');
  // logWindow.webContents.openDevTools();
  // logWindow.on('close', (event) => {
  //   logWindow.hide();
  //   logWindow.setSkipTaskbar(true);
  //   event.preventDefault();
  // })

  // Create the browser window.
  mainWindow = new BrowserWindow({
    minWidth: 1366,
    minHeight: 760,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })
  mainWindow.loadURL('http://localhost:4200')
  // mainWindow.on('close', () => { 
  //   destoryWindow(logWindow);
  //   killBackend();
  // })
  // mainWindow.once('ready-to-show', () => {
  //   logWindow.hide();
  // })
}

function createTray (win) {
  tray = new Tray(path.join(__dirname, 'icon.ico'));
  const contextMenu = Menu.buildFromTemplate([
     {label: 'show', click: () => {win.show()}},
   ])
   tray.setContextMenu(contextMenu)
}

function destoryWindow(win) {
  if (!win.isDestroyed()) {
    win.destroy()
  }
}

function killBackend() {
  if (backend) {
    exec('kill -9 $(lsof -t -i:7007)', (error, stdout, stderr) => {
      if (error) {
        console.log('kill failed..')
        return ;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      console.log('backend killed.')
    })
  }
}

function startBackend() {
  backend = spawn('python -u', ['/home/xyz/xyz-studio-back/app.py'], {
    shell: true
  })
  backend.stdout.on('data', (data) => {
    // console.log(data.toString('utf8'))
    if (!logWindow.isDestroyed()) {
      console.log(data.toString('utf-8'));
      logWindow.webContents.send('send-backend-log', data.toString('utf-8'));
    }
  })
  backend.stderr.on('data', (data) => {
    if (!logWindow.isDestroyed()) {
      console.log(data.toString('utf-8'));
      logWindow.webContents.send('send-backend-log', data.toString('utf-8'));
    }
  })
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  // startBackend();
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('show-context-menu', (event) => {
  const template = [
    {
      label: '查看后端LOG',
      click: () => {
        if (!logWindow.isVisible()) {
          logWindow.show();
        } else {
          logWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: '打开/关闭控制台',
      click: () => { 
        mainWindow.webContents.isDevToolsOpened() ? 
        mainWindow.webContents.closeDevTools() :
        mainWindow.webContents.openDevTools()
      }
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  menu.popup(BrowserWindow.fromWebContents(event.sender))
})