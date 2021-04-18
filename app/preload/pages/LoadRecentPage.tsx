import React from "react";
import {DataTable, MDCDataTableContainer, OutlinedButton} from "../elements/MDCWrapper";
import {Recents} from "../settings/recentConnections";
import constants from "../util/constants";
import {showErrorDialog} from "../elements/ErrorDialog";
import {getLogger} from "log4js";
import GoBackTopAppBar from "../elements/GoBackTopAppBar";
import {AnySettings, DatabaseProvider, RecentDatabase, SQLiteSettings} from "../../shared/Settings";

const logger = getLogger();

/**
 * A page for loading a recent database
 */
export default class LoadRecentPage extends React.Component {
    /**
     * The data table containing the elements
     * @private
     */
    private dataTable: DataTable = null;

    public render(): React.ReactNode {
        return (
            <GoBackTopAppBar id={'load-recent-database'} title={"Load recent"}>
                <DataTable ref={e => this.dataTable = e} style={{width: '100%'}}>
                    <MDCDataTableContainer headers={["Database", "Load", "Remove"]}>
                        {this.getRows()}
                    </MDCDataTableContainer>
                </DataTable>
            </GoBackTopAppBar>
        );
    }

    /**
     * Disable all buttons in the data table
     */
    public disableAllButtons(): void {
        const buttons = this.dataTable.element.getElementsByTagName('button');
        for (let i: number = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }
    }

    /**
     * Generate all rows
     *
     * @return the generated sql info rows
     * @private
     */
    private getRows(): React.ReactNode {
        return Recents.recents.map(value => (
            <RecentDatabaseElement database={value} key={value.id} parent={this}/>
        ));
    }
}

/**
 * The recent database element properties
 */
interface RecentDatabaseElementProps {
    // The database setting
    database: RecentDatabase;
    // The parent element
    parent: LoadRecentPage;
}

/**
 * A recent database element
 */
class RecentDatabaseElement extends React.Component<RecentDatabaseElementProps> {
    /**
     * Create a recent database element
     *
     * @param props the properties
     */
    public constructor(props: RecentDatabaseElementProps) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.onRemove = this.onRemove.bind(this);
    }

    public render(): React.ReactNode {
        return (
            <tr className="mdc-data-table__row">
                <th className="mdc-data-table__cell load-recent-page__main-cell" scope="row">
                    <div className="load-recent-page__heading-container">
                        <h1 className="load-recent-page__heading">
                            {this.props.database.setting.provider}
                        </h1>
                    </div>

                    <p className="load-recent-page__paragraph">
                        <span>{"ID: "}</span>
                        <span className="load-recent-page__info-param">
                            {this.props.database.id}
                        </span>
                    </p>

                    {this.getInfoParagraphs()}
                </th>
                <td className="mdc-data-table__cell">
                    <OutlinedButton text={"Load"} onClick={this.onLoad}/>
                </td>
                <td className="mdc-data-table__cell">
                    <OutlinedButton text={"Remove"} onClick={this.onRemove}/>
                </td>
            </tr>
        );
    }

    /**
     * Get the info paragraphs
     *
     * @return the generated paragraphs
     * @private
     */
    private getInfoParagraphs(): React.ReactNode[] {
        const res: React.ReactNode[] = [];
        res.push((
            <p className="load-recent-page__paragraph" key={0}>
                <span>
                    {this.props.database.setting.provider == DatabaseProvider.SQLite ? "File: " : "URL: "}
                </span>
                <span className="load-recent-page__info-param">
                    {
                        this.props.database.setting.provider == DatabaseProvider.SQLite ?
                            (this.props.database.setting as SQLiteSettings).file :
                            (this.props.database.setting as AnySettings).url
                    }
                </span>
            </p>
        ));

        if (this.props.database.setting.provider != DatabaseProvider.SQLite) {
            res.push((
                <p className="load-recent-page__paragraph" key={1}>
                    <span>{"Username: "}</span>
                    <span className="load-recent-page__info-param">
                        {(this.props.database.setting as AnySettings).user}
                    </span>
                </p>
            ));
        }

        return res;
    }

    /**
     * Called when a recent database is loaded
     * @private
     */
    private async onLoad(): Promise<void> {
        this.props.parent.disableAllButtons();
        try {
            logger.info("Loading a recent database with id:", this.props.database.id);
            const toLoad = await Recents.get(this.props.database.id);

            constants.activeSetting = toLoad;
            await constants.mainComponent.onLoad(toLoad.setting);
        } catch (e) {
            logger.error("An error occurred while loading a recently used database:", e);
            showErrorDialog("Could not load the database. Error:", e.stack);
            constants.mainComponent.gotoStartPage();
        }
    }

    /**
     * Called when a recent database is removed from the list
     * @private
     */
    private onRemove(): void {
        Recents.delete(this.props.database.id);
        this.props.parent.forceUpdate();
    }
}