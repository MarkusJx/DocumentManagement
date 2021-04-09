import {exec} from "child_process";

/**
 * Get the command line option to open a file
 * Source: https://stackoverflow.com/a/29917107
 *
 * @return the command line
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

/**
 * A utility class
 */
export default class util {
    /**
     * Open a file using the default program
     *
     * @param filePath the path to the file to open
     */
    public static openFileUsingDefaultProgram(filePath: string): void {
        if (process.platform === 'win32') {
            exec(`${getCommandLine()} "${filePath}"`, {
                shell: 'powershell.exe'
            });
        } else {
            exec(`${getCommandLine()} "${filePath}"`);
        }
    }
}