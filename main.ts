import {app, BrowserWindow, dialog, ipcMain, Menu, MenuItem} from 'electron';
import {autoUpdater} from "electron-updater";
import windowStateKeeper from "electron-window-state";
import Store from "electron-store";
import path from 'path';

app.allowRendererProcessReuse = false;

ipcMain.handle('select-directory', async (_event, ...args) => {
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

ipcMain.handle('select-database', async (_event, ...args) => {
    let props: any;
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
    Store.initRenderer();
    autoUpdater.checkForUpdatesAndNotify().then(r => {
        if (r != null)
            console.log(r);
    });

    const menu = new Menu();
    Menu.setApplicationMenu(menu);

    const mainWindowState = windowStateKeeper({
        defaultWidth: 705,
        defaultHeight: 830
    });

    // Create the browser window.
    const mainWindow: BrowserWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minHeight: 500,
        minWidth: 530,
        titleBarStyle: "hidden",
        frame: false,
        resizable: true,
        webPreferences: {
            preload: path.join(__dirname, 'src', 'main.js'),
            contextIsolation: true,
            worldSafeExecuteJavaScript: true,
            nodeIntegration: false,
            webSecurity: true,
            enableRemoteModule: true
        }
    });

    menu.append(new MenuItem({
        label: 'File',
        submenu: [
            {
                label: 'Load database',
                click: () => {
                    mainWindow.webContents.send('load-database');
                }
            },
            {
                label: 'Create database',
                click: () => {
                    mainWindow.webContents.send('create-database');
                }
            },
            {
                label: 'Go to start screen',
                click: () => {
                    mainWindow.webContents.send('goto-start-screen');
                }
            },
            {
                label: 'Settings',
                click: () => {
                    // TODO
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Exit',
                click: () => {
                    app.quit();
                }
            }
        ]
    }));

    let shouldClose: boolean = false;
    mainWindow.on('close', (e) => {
        if (!shouldClose) {
            shouldClose = true;
            e.preventDefault();
            mainWindow.webContents.send('close');
        }
    });

    ipcMain.on('before-close-finished', () => {
        mainWindow.close();
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, '..', 'ui', 'index.html')).then();

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
