import {app, BrowserWindow, dialog, ipcMain} from 'electron';
import path from 'path';

app.allowRendererProcessReuse = false;

ipcMain.handle('select-directory', async (event, ...args) => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: args[0]
    });
    if (result.canceled) {
        return null;
    } else {
        return result.filePaths[0];
    }
});

ipcMain.handle('select-database', async (event, ...args) => {
    let props;
    if (args[0]) {
        props = ['openFile', 'promptToCreate'];
    } else {
        props = ['openFile'];
    }

    const result = await dialog.showOpenDialog({
        properties: props,
        filters: [
            {
                name: 'database files',
                extensions: [
                    "db"
                ]
            }
        ],
        title: args[1]
    });

    if (result.canceled) {
        return null;
    } else {
        return result.filePaths[0];
    }
});

function createWindow(): void {
    // Create the browser window.
    const mainWindow: BrowserWindow = new BrowserWindow({
        width: 1600,
        height: 1200,
        webPreferences: {
            preload: path.join(__dirname, 'src', 'main.js'),
            contextIsolation: true
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile('ui/index.html');

    // Open the DevTools.
    mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function (): void {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function (): void {
    if (process.platform !== 'darwin') app.quit();
});
