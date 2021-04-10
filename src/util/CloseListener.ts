import {ipcRenderer} from "electron";

/**
 * A close listener function
 */
type listenerFunc = () => Promise<void>;

/**
 * A class for listening for an close event,
 * which will be called once the windows is about to close
 */
export default class CloseListener {
    /**
     * The active listeners
     * @private
     */
    private static readonly listeners: listenerFunc[] = [];

    /**
     * Listen for the window to be closed
     *
     * @param listener the listener function
     */
    public static listen(listener: listenerFunc): void {
        CloseListener.listeners.push(listener);
    }

    /**
     * Call the listeners.
     * NOTE: This should not be called outside this file
     */
    public static async callListeners(): Promise<void> {
        for (let i: number = 0; i < CloseListener.listeners.length; i++) {
            try {
                await CloseListener.listeners[i]();
            } catch (e) {
                // TODO: Log error
            }
        }
    }
}

// Listen for the close event and call all listeners
ipcRenderer.on('close', async () => {
    await CloseListener.callListeners();
    ipcRenderer.send('before-close-finished');
});