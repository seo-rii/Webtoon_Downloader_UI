const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')

let win;

ipcMain.on('restart', () => {
    if (win) {
        win.loadURL('');
        setTimeout(() => {
            win.loadURL(getFramePath());
        }, 500);
    }
});

function getFramePath(resName) {
    let locale = app.getLocale();
    let supportedLanguage = ['ko'];
    if (!supportedLanguage.includes(locale)) locale = 'ko';
    return `file://${__dirname}/frame.html?locale=${locale}&resName=${resName}.html`;
}

function createWindow() {
    win = new BrowserWindow({
        width: 900, height: 600, webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        }, icon: path.join(__dirname, 'logo.ico'), frame: false
    });
    win.setMenu(null);
    win.loadURL(getFramePath());

    win.webContents.openDevTools({mode: "detach"});

    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', createWindow);


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
