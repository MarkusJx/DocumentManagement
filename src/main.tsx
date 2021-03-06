import React from "react";
import * as ReactDOM from "react-dom";
import {MainDataTable} from "./dataTable/MainDataTable";
import {FileScanner} from "./databaseWrapper";
import {ipcRenderer} from "electron";

export async function main() {
    await ipcRenderer.invoke('select-database');

    const table: MainDataTable = ReactDOM.render(
        // @ts-ignore
        <MainDataTable directory={null} showProgress={true}/>,
        document.getElementById('content-root')
    ) as unknown as MainDataTable;

    const fileScanner = new FileScanner("C:\\Users\\marku\\CloudStation");
    const rootDir = await fileScanner.scan();
    console.log("Scan finished");

    ipcRenderer.invoke('select-directory').then((result) => {
        console.log(result);
    });

    table.directory = rootDir;
    table.showProgress = false;
    table.forceUpdate();
    table.componentDidMount();
}
