import React from "react";
import constants from "../util/constants";
import {topAppBar} from "./MDCWrapper";
import Tooltip from "./Tooltip";

/**
 * The go back top app bar properties
 */
interface GoBackTopAppBarProps {
    // The top app bar id
    id: string;
    // The top app bar title
    title: string;
}

/**
 * A top app bar only containing
 * a single 'Go Back' button
 */
export default class GoBackTopAppBar extends React.Component<GoBackTopAppBarProps> {
    /**
     * The tooltip id
     * @private
     */
    private readonly tooltipId: string;

    /**
     * Create a go back top app bar
     *
     * @param props the properties
     */
    public constructor(props: GoBackTopAppBarProps) {
        super(props);

        this.tooltipId = `${this.props.id}-top-app-bar-nav-back-tooltip`;
    }

    /**
     * Called when the 'Go Back' button was clicked
     * @private
     */
    private static backClick(): void {
        constants.mainComponent.gotoStartPage();
    }

    public render(): React.ReactNode {
        return (
            <>
                <topAppBar.Header>
                    <topAppBar.NavigationSection title={this.props.title}>
                        <topAppBar.NavigationButton onClick={GoBackTopAppBar.backClick} label={"Back"}
                                                    iconName={"arrow_back"}
                                                    describedby={this.tooltipId}/>
                    </topAppBar.NavigationSection>
                </topAppBar.Header>
                <topAppBar.Main>
                    {this.props.children}
                </topAppBar.Main>
            </>
        );
    }

    public componentDidMount(): void {
        Tooltip.create({
            id: this.tooltipId,
            text: 'Go back to the start page'
        });
    }

    public componentWillUnmount(): void {
        Tooltip.delete(this.tooltipId);
    }
}