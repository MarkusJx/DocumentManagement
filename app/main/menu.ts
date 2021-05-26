import {app, BrowserWindow, Menu, MenuItem} from "electron";

export function setMenu(menu: Menu, mainWindow: BrowserWindow): void {
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
                label: 'Quit',
                click: () => {
                    app.quit();
                },
                accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4'
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
    }));

    menu.append(new MenuItem({
        label: 'Help',
        submenu: [
            {
                label: 'View Licenses',
                click: () => {
                    mainWindow.webContents.send('show-license-viewer');
                }
            }
        ]
    }));
}