import { app, BrowserWindow } from 'electron';

let loginWindow, mainWindow;

function appInit () {
  loginWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        webSecurity: false,
        nodeIntegration: true
    }
  });
  global.loginWindow = loginWindow;
  loginWindow.loadURL(process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT}/index.html` : `file://${__dirname}/index.html`);

  loginWindow.webContents.openDevTools();

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        webSecurity: false,
        nodeIntegration: true
    }
  });
  global.mainWindow = mainWindow;

  mainWindow.loadURL(process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT}/login.html` : `file://${__dirname}/login.html`);

  mainWindow.webContents.openDevTools();
}

app.whenReady().then(appInit)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) appInit()
})