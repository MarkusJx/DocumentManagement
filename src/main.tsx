import React from "react";
import * as ReactDOM from "react-dom";
import {MainComponent} from "./StartScreen";

export async function main() {
    ReactDOM.render(
        <MainComponent/>,
        document.getElementById('content-root')
    );
}
