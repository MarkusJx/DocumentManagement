import React from "react";
import {DataTable, MDCDataTableContainer, OutlinedButton} from "../elements/MDCWrapper";
import {RecentDatabase, Recents} from "../settings/recentConnections";
import constants from "../util/constants";
import {showErrorDialog} from "../elements/ErrorDialog";
import {AnySettings, DatabaseProvider, SQLiteSettings} from "./DatabaseConfigurator";
import MDCCSSProperties from "../util/MDCCSSProperties";
import {getLogger} from "log4js";

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
            <DataTable ref={e => this.dataTable = e}>
                <MDCDataTableContainer headers={["Database", "Load", "Remove"]}>
                    {this.getRows()}
                </MDCDataTableContainer>
            </DataTable>
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
     * The info paragraph style
     * @private
     */
    private static paragraphStyle: React.CSSProperties = {
        margin: 0,
        fontFamily: '"Open Sans", sans-serif',
        color: '#000000',
        fontSize: '15.2px'
    };

    /**
     * The info parameter style
     * @private
     */
    private static infoParamStyle: React.CSSProperties = {
        fontWeight: 300
    };

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
        const style: MDCCSSProperties = {
            "--mdc-theme-primary": 'blue'
        };

        const mainCellStyle: React.CSSProperties = {
            padding: '12px'
        };

        const headingStyle: React.CSSProperties = {
            fontFamily: '"Open Sans", sans-serif',
            color: '#464646',
            margin: '0 0 6px 0',
            width: 'max-content',
            fontSize: '26px'
        };

        const headingContainerStyle: React.CSSProperties = {
            width: 'max-content',
            borderBottom: '1px solid #b7b7b7',
            marginBottom: '10px'
        };

        return (
            <tr className="mdc-data-table__row" style={style}>
                <th className="mdc-data-table__cell" scope="row" style={mainCellStyle}>
                    <div style={headingContainerStyle}>
                        <h1 style={headingStyle}>{this.props.database.setting.provider}</h1>
                    </div>

                    <p style={RecentDatabaseElement.paragraphStyle}>
                        <span>{"ID: "}</span>
                        <span style={RecentDatabaseElement.infoParamStyle}>
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
            <p style={RecentDatabaseElement.paragraphStyle} key={0}>
                <span>
                    {this.props.database.setting.provider == DatabaseProvider.SQLite ? "File: " : "URL: "}
                </span>
                <span style={RecentDatabaseElement.infoParamStyle}>
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
                <p style={RecentDatabaseElement.paragraphStyle} key={1}>
                    <span>{"Username: "}</span>
                    <span style={RecentDatabaseElement.infoParamStyle}>
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
            await constants.mainComponent.onLoad(toLoad.setting);
        } catch (e) {
            logger.error("An error occurred while loading a recently used database:", e);
            showErrorDialog("Could not load the database. Error:", e.message);
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