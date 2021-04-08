import React from "react";
import ReactDOM from "react-dom";
import {MainComponent} from "./StartScreen";
import {ScanLoadingScreen} from "./LoadingScreens";
import constants from "./constants";

/**
 * The main class
 */
class Main {
    /**
     * The main component
     * @private
     */
    private static mainComponent: MainComponent = null;

    /**
     * The main function
     */
    public static main(): void {
        ReactDOM.render(
            <MainComponent ref={e => Main.mainComponent = e}/>,
            document.getElementById('content-root')
        );

        ReactDOM.render(
            <ScanLoadingScreen ref={e => constants.scanLoadingScreen = e}/>,
            document.getElementById('loading-screen-container')
        )
    }

    /**
     * Called before the content is unloaded
     */
    public static onUnload(): void {
        if (Main.mainComponent.databaseManager) {
            Main.mainComponent.databaseManager.close().then();
        }
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    Main.main();
    import("./Titlebar").then(i => i.create());
});

window.onbeforeunload = Main.onUnload.bind(Main);
