import {app, BrowserWindow, dialog, ipcMain, Menu, MenuItem} from 'electron';
import {autoUpdater} from "electron-updater";
import windowStateKeeper from "electron-window-state";
import Store from "electron-store";
import path from 'path';
import log4js from "log4js";

app.allowRendererProcessReuse = false;

log4js.configure({
    appenders: {
        out: {
            type: 'stdout',
            layout: {
                type: 'pattern',
                pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%f{2}:%l] [%p] %m'
            }
        },
        app: {
            type: 'file',
            filename: 'main.log',
            layout: {
                type: 'pattern',
                pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%f{2}:%l] [%p] %m'
            },
            maxLogSize: 100000
        }
    },
    categories: {
        default: {
            appenders: ['out', 'app'],
            level: 'info',
            enableCallStack: true
        }
    }
});

const logger = log4js.getLogger();

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

ipcMain.handle('show-error-dialog', (_event, ...args) => {
    dialog.showErrorBox(args[0], args[1]);
});

/**
 * Print the system info
 */
function printSystemInfo() {
    logger.info("Operating system:", process.platform);
    logger.info("Architecture:", process.arch);
    logger.info("System version:", process.getSystemVersion());
    logger.info("Total memory:", process.getSystemMemoryInfo().total);
}

printSystemInfo();

/**
 * Create the main window
 */
function createWindow(): void {
    logger.info("Creating the main window");
    Store.initRenderer();
    autoUpdater.checkForUpdatesAndNotify().then(r => {
        if (r != null) {
            logger.info("Update check result:", r);
        }
    }).catch(e => {
        logger.error("Could not check for updates:", e);
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
        frame: false,
        resizable: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload', 'index.js'),
            contextIsolation: true,
            worldSafeExecuteJavaScript: true,
            nodeIntegration: false,
            webSecurity: true,
            enableRemoteModule: true,
            devTools: true
        }
    });

    mainWindowState.manage(mainWindow);

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
                label: 'Load recent',
                click: () => {
                    mainWindow.webContents.send('load-recent-database');
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
                    mainWindow.webContents.send('open-settings');
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Exit',
                click: () => {
                    app.quit();
                },
                accelerator: 'Alt+F4'
            }
        ]
    }));

    menu.append(new MenuItem({
        label: 'Options',
        submenu: [
            {
                label: 'Toggle DevTools',
                click: () => {
                    if (mainWindow.webContents.isDevToolsOpened()) {
                        mainWindow.webContents.closeDevTools();
                    } else {
                        mainWindow.webContents.openDevTools();
                    }
                },
                accelerator: 'Control+Shift+I'
            }
        ]
    }))

    let shouldClose: boolean = false;
    mainWindow.on('close', (e) => {
        if (!shouldClose) {
            logger.info("Running before close actions");
            shouldClose = true;
            e.preventDefault();
            mainWindow.webContents.send('close');
        }
    });

    ipcMain.on('before-close-finished', () => {
        logger.info("The before close actions finished, closing the window");
        mainWindow.close();
    });

    // Load index.html
    logger.info("Loading index.html");
    mainWindow.loadFile(path.join(__dirname, '..', 'app', 'ui', 'index.html')).then(() => {
        logger.info("index.html loaded");
    }).catch(e => {
        logger.error("Could not load the index.html:", e);
    });

    mainWindow.webContents.openDevTools();
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
    if (process.platform !== 'darwin') {
        logger.info("Quit");
        app.quit();
    }
});