import React from "react";
import EmptyProps from "../util/EmptyProps";
import {Dialog} from "../elements/MDCWrapper";
import {getLogger} from "log4js";
import ReactDOM from "react-dom";
import constants from "../util/constants";
import {AnySettings, DatabaseProvider, SQLiteSettings} from "../../shared/Settings";

const logger = getLogger();

/**
 * The static instance
 */
let instance: DatabaseInfoElement = null;

/**
 * A database info dialog
 */
export default class DatabaseInfo {
    /**
     * Show the dialog
     */
    public static show(): void {
        instance.show();
    }
}

/**
 * The database info element
 */
class DatabaseInfoElement extends React.Component<EmptyProps> {
    /**
     * The actual dialog
     * @private
     */
    private dialog: Dialog = null;

    /**
     * Get the database provider string
     *
     * @return the database provider string or null if the active setting is not set
     * @private
     */
    private static get databaseProvider(): string | null {
        if (constants.activeSetting != null && constants.activeSetting.setting != null) {
            return constants.activeSetting.setting.provider;
        } else {
            return null;
        }
    }

    /**
     * Get the database id
     *
     * @return the database id or null if the active setting is not set
     * @private
     */
    private static get databaseId(): string | null {
        if (constants.activeSetting != null && constants.activeSetting.setting != null) {
            return constants.activeSetting.id;
        } else {
            return null;
        }
    }

    /**
     * Get the local root path
     *
     * @return the root directory path or null if the active setting is not set
     * @private
     */
    private static get localPath(): string | null {
        if (constants.activeSetting != null && constants.activeSetting.setting != null) {
            return constants.databaseManager.getSourcePath();
        } else {
            return null;
        }
    }

    /**
     * Get additional database info such as the database
     * file for SQLite providers or the connection url
     * and username for any other database
     *
     * @return the additional info element or null if the active setting is not set
     * @private
     */
    private static getAdditionalInfos(): React.ReactNode | React.ReactNode[] | null {
        if (constants.activeSetting != null && constants.activeSetting.setting != null) {
            if (constants.activeSetting.setting.provider == DatabaseProvider.SQLite) {
                const setting = constants.activeSetting.setting as SQLiteSettings;
                return (
                    <div className="file-info__paragraph">
                        <span>Database file:</span>
                        <span className="file-info__property">{setting.file}</span>
                    </div>
                );
            } else {
                const setting = constants.activeSetting.setting as AnySettings;
                return [
                    (
                        <div className="file-info__paragraph" key="url">
                            <span>Database url:</span>
                            <span className="file-info__property">{setting.url}</span>
                        </div>
                    ),
                    (
                        <div className="file-info__paragraph" key="username">
                            <span>Connection user name:</span>
                            <span className="file-info__property">{setting.user}</span>
                        </div>
                    )
                ];
            }
        } else {
            return null;
        }
    }

    /**
     * Show the dialog
     */
    public show(): void {
        this.forceUpdate();
        this.dialog.open();
    }

    public render(): React.ReactNode {
        return (
            <Dialog titleId="database-info-dialog-title" contentId="database-info-dialog-content"
                    title={"Database Info"} ref={e => this.dialog = e} hasCancelButton={false}>
                <div className="file-info__paragraph">
                    <span>Provider:</span>
                    <span className="file-info__property">{DatabaseInfoElement.databaseProvider}</span>
                </div>
                <div className="file-info__paragraph">
                    <span>Database ID:</span>
                    <span className="file-info__property">{DatabaseInfoElement.databaseId}</span>
                </div>
                <div className="file-info__paragraph">
                    <span>Root directory path:</span>
                    <span className="file-info__property">{DatabaseInfoElement.localPath}</span>
                </div>
                {DatabaseInfoElement.getAdditionalInfos()}
            </Dialog>
        );
    }
}

window.addEventListener('DOMContentLoaded', () => {
    logger.info("Rendering database info element");
    try {
        ReactDOM.render(
            <DatabaseInfoElement ref={e => instance = e}/>,
            document.getElementById('database-info-dialog-container')
        );
    } catch (e) {
        logger.error("Could not render the database info element:", e);
    }
})