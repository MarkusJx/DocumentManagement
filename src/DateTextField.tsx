import React from "react";
import DateRangePicker from '@wojtekmaj/react-daterange-picker/dist/entry.nostyle';
import DatePicker from 'react-date-picker/dist/entry.nostyle';

export interface DateTextFieldProps {
    style?: React.CSSProperties;
}

interface DateTextFieldState {
    value: Date;
}

export class DateTextField extends React.Component<DateTextFieldProps, DateTextFieldState> {
    /**
     * The style of the element
     * @private
     */
    private readonly style: React.CSSProperties;

    /**
     * Create a date field
     *
     * @param props the properties
     */
    public constructor(props: DateTextFieldProps) {
        super(props);

        this.state = {
            value: null
        };

        if (props.style) {
            this.style = props.style;
        } else {
            this.style = {};
        }

        this.style.fontFamily = "sans-serif";

        this.onChange = this.onChange.bind(this);
    }

    /**
     * Get the value
     *
     * @return the value
     */
    public get value(): Date {
        return this.state.value;
    }

    /**
     * Set the value
     *
     * @param value the new date
     */
    public set value(value: Date) {
        this.setState({
            value: value
        });
    }

    public render(): React.ReactNode {
        return (
            <div style={this.style}>
                <DatePicker onChange={this.onChange} value={this.state.value}/>
            </div>
        );
    }

    /**
     * A function to be called on value change
     *
     * @param value the new value
     * @private
     */
    private onChange(value: Date): void {
        this.setState({
            value: value
        });
    }
}

/**
 * The properties for a {@link DateRangeTextField}
 */
export interface DateRangeTextFieldProps {
    // An optional style property
    style?: React.CSSProperties;
}

/**
 * The state of a {@link DateRangeTextField}
 */
interface DateRangeTextFieldState {
    // The value
    value: Date[];
}

/**
 * A date text field to select date ranges
 */
export class DateRangeTextField extends React.Component<DateRangeTextFieldProps, DateRangeTextFieldState> {
    /**
     * The style of the element
     * @private
     */
    private readonly style: React.CSSProperties;

    /**
     * Create a date range field
     *
     * @param props the properties
     */
    public constructor(props: DateRangeTextFieldProps) {
        super(props);

        this.state = {
            value: null
        };

        if (props.style) {
            this.style = props.style;
        } else {
            this.style = {};
        }

        this.style.fontFamily = "sans-serif";

        this.onChange = this.onChange.bind(this);
    }

    /**
     * Get the value
     *
     * @return the value
     */
    public get value(): Date[] {
        return this.state.value;
    }

    public render(): React.ReactNode {
        return (
            <div style={this.style}>
                <DateRangePicker onChange={this.onChange} value={this.state.value}/>
            </div>
        );
    }

    /**
     * A function to be called on value change
     *
     * @param value the new value
     * @private
     */
    private onChange(value: Date[]): void {
        this.setState({
            value: value
        });
    }
}