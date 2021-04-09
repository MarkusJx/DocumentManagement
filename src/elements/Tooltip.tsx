import React from "react";
import ReactDOM from "react-dom";

import {MDCTooltip} from "@material/tooltip";

// The current tooltip container
let tooltipContainer: TooltipContainer = null;

/**
 * The properties for the TooltipContainer
 */
type TooltipContainerProps = {};

/**
 * The actual tooltip properties
 */
type _TooltipProps = {
    id: string,
    key: string,
    text: string
}

/**
 * The tooltip properties used to create a tooltip
 */
type TooltipProps = {
    id?: string,
    text: string
};

/**
 * A wrapper around the mdc tooltip class
 */
export default class Tooltip extends React.Component<_TooltipProps> {
    /**
     * The id of the tooltip
     * @private
     */
    private readonly id: string;

    /**
     * The text of the tooltip
     * @private
     */
    private readonly text: string;

    /**
     * Create a new tooltip.
     * NOTE: Don't use this, use {@link Tooltip.create} instead.
     *
     * @param props the properties
     */
    public constructor(props: _TooltipProps) {
        super(props);
        this.id = props.id;
        this.text = props.text;
    }

    /**
     * Create a new tooltip
     *
     * @param props the tooltip properties
     * @return the id of the created tooltip
     */
    public static create(props: TooltipProps): string {
        return tooltipContainer.addTooltip(props);
    }

    /**
     * Delete a tooltip
     *
     * @param id the id of the tooltip to delete
     */
    public static delete(id: string): void {
        tooltipContainer.deleteTooltip(id);
    }

    public render(): React.ReactNode {
        // Set the z-index to a high value
        const style: React.CSSProperties = {
            zIndex: 9999
        };

        return (
            <div id={this.id} className="mdc-tooltip" role="tooltip" aria-hidden="true" style={style}>
                <div className="mdc-tooltip__surface">
                    {this.text}
                </div>
            </div>
        );
    }

    public componentDidMount(): void {
        const $this = ReactDOM.findDOMNode(this) as Element;
        MDCTooltip.attachTo($this);
    }
}

/**
 * A class containing tooltips
 */
class TooltipContainer extends React.Component<TooltipContainerProps> {
    /**
     * The id of the next tooltip object to generate
     * @private
     */
    private static nextTooltipId = 0;

    /**
     * The properties of all tooltips to store
     * @private
     */
    private readonly tooltipProps: _TooltipProps[];

    /**
     * Create a TooltipContainer
     *
     * @param props the properties
     */
    public constructor(props: TooltipContainerProps) {
        super(props);
        this.tooltipProps = [];
    }

    /**
     * Add a tooltip to the container
     *
     * @param props the properties of the tooltip to generate
     * @return the id of the tooltip
     */
    public addTooltip(props: TooltipProps): string {
        const id: string = props.id ? props.id : ('tooltip-' + TooltipContainer.nextTooltipId++);

        this.tooltipProps.push({
            text: props.text,
            key: id,
            id: id
        });

        this.forceUpdate();

        return id;
    }

    /**
     * Delete a tooltip
     *
     * @param id the id of the tooltip to delete
     */
    public deleteTooltip(id: string): void {
        // Find the element in tooltipProps to delete
        const index: number = this.tooltipProps.findIndex((el: _TooltipProps) => el.id === id);
        if (index >= 0) {
            this.tooltipProps.splice(index, 1);
        }

        this.forceUpdate();
    }

    public render(): React.ReactNode {
        return (
            this.tooltipProps.map(prop =>
                <Tooltip key={prop.key} text={prop.text} id={prop.id}/>
            )
        );
    }
}

// Listen for content load and create the tooltip container
window.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <TooltipContainer ref={e => tooltipContainer = e}/>,
        document.getElementById('tooltip-container')
    );
});

