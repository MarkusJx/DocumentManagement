import React from "react";
import ReactDOM from "react-dom";
import {MainComponent} from "./StartScreen";

class Main {
    private static mainComponent: MainComponent = null;

    public static main(): void {
        ReactDOM.render(
            <MainComponent ref={e => Main.mainComponent = e}/>,
            document.getElementById('content-root')
        );
    }

    public static onUnload(): void {
        if (Main.mainComponent.databaseManager) {
            Main.mainComponent.databaseManager.close().then();
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    Main.main();
});

window.onbeforeunload = Main.onUnload.bind(Main);
