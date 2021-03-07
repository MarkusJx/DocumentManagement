import React from "react";
import * as ReactDOM from "react-dom";
import {MainComponent} from "./StartScreen";
import * as constants from "./constants";

export async function main() {
    ReactDOM.render(
        <MainComponent/>,
        document.getElementById('content-root')
    );

    constants.init();
}
