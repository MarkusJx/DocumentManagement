import {app, BrowserWindow, dialog, ipcMain, Menu} from 'electron';
import {autoUpdater} from "electron-updater";
import windowStateKeeper from "electron-window-state";
import Store from "electron-store";
import path from 'path';
import log4js from "log4js";
import {createStore} from "../shared/Settings";
import * as fs from "fs";
import FindJavaHome from "../shared/FindJavaHome";
import {setMenu} from "./menu";
import configureLogger from "./configureLogger";
import "core-js/stable";
import "regenerator-runtime/runtime";

const isDev = process.env.NODE_ENV === "development";

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

/**
 * Create the main window
 */
async function createWindow(): Promise<void> {
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
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, 'preload.bundled.js'),
            contextIsolation: true,
            worldSafeExecuteJavaScript: true,
            nodeIntegration: false,
            webSecurity: true,
            enableRemoteModule: true,
            devTools: true
        }
    });

    // Manage the main window state.
    // This saves and restores the windows
    // positions and sizes on open/close
    mainWindowState.manage(mainWindow);

    // Create the application menu
    setMenu(menu, mainWindow);

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
        if (mainWindow.webContents.isDevToolsOpened()) {
            mainWindow.webContents.closeDevTools();
        }
        mainWindow.close();
    });

    const store = createStore();
    const lib_regex = /.+\.(dll|so|dylib)$/;
    const jvmPath: string = store.get('jvmPath');
    if (jvmPath === null || !fs.existsSync(jvmPath) || !lib_regex.test(jvmPath)) {
        try {
            const home = await FindJavaHome();
            store.set('jvmPath', home);
        } catch (e) {
            logger.error("Could not find the JVM:", e);
            dialog.showErrorBox("Could not find a JVM", e.stack.toString());
            return;
        }
    }
    console.log("Using jvm library:", store.get('jvmPath'));

    // Load index.html
    logger.info("Loading index.html");
    try {
        await mainWindow.loadFile(path.join(__dirname, '..', 'app', 'ui', 'index.html'));
        //await mainWindow.loadFile("app/ui/index.html");
        logger.info("index.html loaded");
    } catch (e) {
        logger.error("Could not load the index.html:", e);
        dialog.showErrorBox("Could not load the ui", e.stack.toString());
        return;
    }

    if (process.argv.includes('--debug') || isDev) {
        mainWindow.webContents.openDevTools();
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    configureLogger();
    printSystemInfo();
    createWindow().then();

    app.on('activate', function (): void {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow().then();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function (): void {
    // if (process.platform !== 'darwin') {
    logger.info("Quit");
    app.quit();
    // }
});
