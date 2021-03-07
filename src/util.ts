import {exec} from "child_process";

/**
 * Source: https://stackoverflow.com/a/29917107
 */
function getCommandLine(): string {
    switch (process.platform) {
        case 'darwin' :
            return 'open';
        case 'win32' :
            return 'start';
        default :
            return 'xdg-open';
    }
}

export function openFileUsingDefaultProgram(filePath: string): void {
    if (process.platform === 'win32') {
        exec(`${getCommandLine()} "${filePath}"`, {
            shell: 'powershell.exe'
        });
    } else {
        exec(`${getCommandLine()} "${filePath}"`);
    }
}