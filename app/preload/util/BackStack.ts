import constants from "./constants";
import {getLogger} from "log4js";
import {showErrorDialog} from "../dialogs/ErrorDialog";

const logger = getLogger();

/**
 * A stack for handling directory back events
 */
export default class BackStack {
    /**
     * The actual directory path stack
     * @private
     */
    private static readonly stack: string[] = [];

    /**
     * The current position on the stack
     * @private
     */
    private static stackPos: number = 0;

    /**
     * Whether the back action should be disabled
     * @private
     */
    private static disabled: boolean = false;

    /**
     * Set whether moving on the stack should be enabled
     *
     * @param enabled whether moving should be enabled
     */
    public static set enabled(enabled: boolean) {
        BackStack.disabled = !enabled;
    }

    /**
     * Go back one directory
     */
    public static goBack(): void {
        if (BackStack.stack.length > 1 && !BackStack.disabled && constants.mainDataTable !== null && BackStack.stackPos > 0) {
            constants.mainDataTable.setDirectory(BackStack.stack[BackStack.decreasePos()])
                .then(BackStack.directoryLoaded)
                .catch(BackStack.directoryLoadError);
        }
    }

    /**
     * Go forward one directory
     */
    public static goForward(): void {
        if ((BackStack.stackPos + 1) < BackStack.stack.length && !BackStack.disabled && constants.mainDataTable !== null) {
            constants.mainDataTable.setDirectory(BackStack.stack[BackStack.increasePos()])
                .then(BackStack.directoryLoaded)
                .catch(BackStack.directoryLoadError);
        }
    }

    /**
     * Push a directory to the list of visited directories
     *
     * @param directory the directory to push
     */
    public static push(directory: string): void {
        const cur = BackStack.stack[BackStack.stackPos];
        const hi = BackStack.stack[Math.min(BackStack.stackPos + 1, BackStack.stack.length - 1)];
        const lo = BackStack.stack[Math.max(BackStack.stackPos - 1, 0)];

        if (directory !== hi && directory !== lo && directory !== cur) {
            BackStack.stack.splice(BackStack.stackPos + 1);
            BackStack.stack.push(directory);
            BackStack.stackPos = Math.max(BackStack.stack.length - 1, 0);
        } else {
            if (directory === hi) {
                BackStack.increasePos();
            } else if (directory === lo) {
                BackStack.decreasePos();
            }
        }
    }

    /**
     * Decrease the position on the stack
     * @private
     */
    private static decreasePos(): number {
        BackStack.stackPos = Math.max(BackStack.stackPos - 1, 0);
        return BackStack.stackPos;
    }

    /**
     * Increase the position on the stack
     * @private
     */
    private static increasePos(): number {
        BackStack.stackPos = Math.min(BackStack.stackPos + 1, BackStack.stack.length - 1);
        return BackStack.stackPos;
    }

    /**
     * Called when the directory was changed
     * @private
     */
    private static directoryLoaded(): void {
        logger.info("Successfully changed directory");
    }

    /**
     * Called when the directory could not be changed
     *
     * @param e the error message
     * @private
     */
    private static directoryLoadError(e: any): void {
        logger.error("Could not change the directory:", e);
        showErrorDialog("Could not change the directory. Error:", e.stack);
        constants.mainComponent.gotoStartPage();
    }
}