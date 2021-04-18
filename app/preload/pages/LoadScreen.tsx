import React from "react";
import {DatabaseConfigurator} from "./DatabaseConfigurator";
import {Button, OutlinedButton} from "../elements/MDCWrapper";
import GoBackTopAppBar from "../elements/GoBackTopAppBar";
import {DatabaseSetting} from "../../shared/Settings";

/**
 * The on load listener function
 */
type onLoad_t = (setting: DatabaseSetting) => Promise<void>;

/**
 * The load screen props
 */
interface LoadScreenProps {
    // The on load listener function
    onLoad: onLoad_t;
}

/**
 * The load database screen
 */
export default class LoadScreen extends React.Component<LoadScreenProps> {
    /**
     * The database configurator
     * @private
     */
    private configurator: DatabaseConfigurator;

    /**
     * The load button
     * @private
     */
    private loadButton: Button;

    /**
     * Create a load screen
     *
     * @param props the properties
     */
    public constructor(props: LoadScreenProps) {
        super(props);

        this.configurator = null;
        this.loadButton = null;

        this.onConfigChange = this.onConfigChange.bind(this);
        this.onLoadImpl = this.onLoadImpl.bind(this);
    }

    public render(): React.ReactNode {
        return (
            <GoBackTopAppBar id={"load-screen"} title={"Load a database"}>
                <div className="load-screen-container">
                    <div className="start-scan-screen">
                        <div className="start-scan-screen-grid-element">
                            <h1 className="load-screen-heading">
                                Load an existing Database
                            </h1>
                        </div>

                        <div className="start-scan-screen-grid-element">
                            <DatabaseConfigurator ref={e => this.configurator = e} onChange={this.onConfigChange}/>
                        </div>

                        <div className="load-screen-load-button centered">
                            <OutlinedButton text={"Load"} onClick={this.onLoadImpl}
                                            ref={e => this.loadButton = e}/>
                        </div>
                    </div>
                </div>
            </GoBackTopAppBar>
        );
    }

    public componentDidMount(): void {
        this.onConfigChange();
    }

    /**
     * The on config changed listener
     * @private
     */
    private onConfigChange(): void {
        this.loadButton.enabled = this.configurator.settings != null;
    }

    /**
     * The on load implementation
     * @private
     */
    private async onLoadImpl(): Promise<void> {
        await this.props.onLoad(this.configurator.settings);
    }
}