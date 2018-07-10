const { app, BrowserWindow, shell } = require('electron');
let mainWindow;

const handleRedirect = (e, url) => {
    console.log(e, url);
    if (url !== e.sender.getURL()) {
        e.preventDefault();
        shell.openExternal(url);
    }
};

function createWindow() {
    mainWindow = new BrowserWindow({ width: 1025, height: 600 });
    mainWindow.loadFile('index.html');

    // mainWindow.webContents.openDevTools();

    mainWindow.webContents.on('will-navigate', handleRedirect);

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    if (mainWindow === null) {
        createWindow();
    }
});
