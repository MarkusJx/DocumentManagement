import React from "react";
import {database} from "../../databaseWrapper";
import {DataTableDirectoryElement, DataTableDocumentElement, DataTableElement} from "./DataTableElement";
import Snackbars from "../../util/Snackbars";
import BackStack from "../../util/BackStack";

interface MainDataTableContentProps {
    directory: database.Directory;
}

/**
 * The main data table content state
 */
interface MainDataTableContentState {
    // The current directory
    directory: database.Directory;
}

/**
 * The main data table content
 */
export default class MainDataTableContent extends React.Component<MainDataTableContentProps, MainDataTableContentState> {
    /**
     * The data table elements
     * @private
     */
    private dataTableElements: DataTableElement<any>[] = [];

    /**
     * Create the main data table content
     *
     * @param props the properties
     */
    public constructor(props: MainDataTableContentProps) {
        super(props);

        this.state = {
            directory: props.directory
        };
    }

    /**
     * Set whether the data table is loading
     *
     * @param loading true if the data table is loading
     */
    public set loading(loading: boolean) {
        this.dataTableElements = this.dataTableElements.filter(e => e != null);

        if (loading) {
            this.dataTableElements.forEach(e => e.enabled = false);
        } else {
            this.dataTableElements.forEach(e => e.enabled = true);
        }
    }

    /**
     * Get the current displayed directory
     *
     * @return the current directory
     */
    public get directory(): database.Directory {
        return this.state.directory;
    }

    /**
     * Set the current directory
     *
     * @param dir the current directory
     */
    public set directory(dir: database.Directory) {
        this.setState({
            directory: dir
        });

        // Add the current directory to the action stack
        BackStack.push(dir.path);

        this.componentDidMount();
    }

    public render(): React.ReactNode | React.ReactNode[] {
        this.dataTableElements = [];
        if (this.directory == null) {
            return (
                <tr className="mdc-data-table__row">
                    <th className="mdc-data-table__cell" scope="row">Loading...</th>
                    <td className="mdc-data-table__cell"/>
                    <td className="mdc-data-table__cell"/>
                    <td className="mdc-data-table__cell"/>
                    <td className="mdc-data-table__cell"/>
                </tr>
            );
        } else {
            const res: React.ReactNode[] = [];
            res.push(...this.directory.documents.map(doc => (
                <DataTableDocumentElement document={doc} key={doc.absolutePath + '-' + doc.exists}
                                          ref={e => this.dataTableElements.push(e)}/>
            )));

            res.push(...this.directory.directories.map(dir => (
                <DataTableDirectoryElement directory={dir} key={dir.name + '-' + dir.exists}
                                           ref={e => this.dataTableElements.push(e)}/>
            )));

            return res;
        }
    }

    public componentDidMount(): void {
        this.dataTableElements = this.dataTableElements.filter(e => e != null);
        if (this.directory != null && !this.dataTableElements.some(e => e.exists()) &&
            this.dataTableElements.length > 0 && (this.directory.path !== "" || this.directory.baseDir !== "")) {
            Snackbars.docsNotFoundSnackbar.snackbarText = "No directory or document in the database exists under the " +
                "specified path. You may want to update the root path.";
            Snackbars.docsNotFoundSnackbar.open();
        }
    }
}