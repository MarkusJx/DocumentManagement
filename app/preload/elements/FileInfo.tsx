import React from "react";
import {database} from "../databaseWrapper";
import constants from "../util/constants";
import EmptyProps from "../util/EmptyProps";

/**
 * The file info state
 */
interface FileInfoState {
    // The current document
    document: database.Document;
}

/**
 * A file info component
 */
export default class FileInfo extends React.Component<EmptyProps, FileInfoState> {
    /**
     * Create a new file info
     *
     * @param props the properties
     */
    public constructor(props: EmptyProps) {
        super(props);

        this.state = {
            document: null
        };
    }

    /**
     * Set the active document
     *
     * @param val the new document
     */
    public set document(val: database.Document) {
        this.setState({
            document: val
        });
    }

    /**
     * Get the file name
     *
     * @return the file name or null if the document is not set
     * @private
     */
    private get filename(): string | null {
        if (this.state.document != null) {
            return this.state.document.filename;
        } else {
            return null;
        }
    }

    /**
     * Get if the file exists
     *
     * @return 'true' if the file exists, 'false' otherwise or null if the document is not set
     * @private
     */
    private get exists(): string | null {
        if (this.state.document != null) {
            return this.state.document.exists ? "true" : "false";
        } else {
            return null;
        }
    }

    /**
     * Get the document path
     *
     * @return the full document path or null if the document is not set
     * @private
     */
    private get documentPath(): string | null {
        if (this.state.document != null) {
            return constants.databaseManager.getSourcePath().replaceAll('\\', '/')
                + '/' + this.state.document.absolutePath;
        } else {
            return null;
        }
    }

    public render(): React.ReactNode {
        return (
            <div className="file-info__container">
                <div className="file-info__heading-container">
                    <h1 className="file-info__heading">File information</h1>
                </div>
                <div className="file-info__content">
                    <div className="file-info__paragraph">
                        <span>File name:</span>
                        <span className="file-info__property">{this.filename}</span>
                    </div>
                    <div className="file-info__paragraph">
                        <span>Exists:</span>
                        <span className="file-info__property">{this.exists}</span>
                    </div>
                    <div className="file-info__paragraph">
                        <span>Path:</span>
                        <span className="file-info__property">{this.documentPath}</span>
                    </div>
                </div>
            </div>
        );
    }
}