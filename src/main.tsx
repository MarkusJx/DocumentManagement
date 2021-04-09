import React from "react";
import ReactDOM from "react-dom";
import {MainComponent} from "./pages/StartScreen";
import {ScanLoadingScreen} from "./elements/LoadingScreens";
import constants from "./util/constants";
import CloseListener from "./util/CloseListener";
import TitleBar from "./util/TitleBar";

/**
 * The main class
 */
class Main {
    /**
     * The main component
     */
    public static mainComponent: MainComponent = null;

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
}

window.addEventListener('DOMContentLoaded', async () => {
    Main.main();
    TitleBar.create();
});

CloseListener.listen(async () => {
    if (Main.mainComponent && Main.mainComponent.databaseManager) {
        await Main.mainComponent.databaseManager.close();
    }
});
