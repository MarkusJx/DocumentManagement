import React from "react";
import DateRangePicker from '@wojtekmaj/react-daterange-picker/dist/entry.nostyle';
import DatePicker from 'react-date-picker/dist/entry.nostyle';

/**
 * The date text field properties
 */
export interface DateTextFieldProps {
    // An optional style
    style?: React.CSSProperties;
}

/**
 * The date text field state
 */
interface DateTextFieldState<T> {
    // The date value
    value: T;
}

abstract class DateTextFieldBase<T, P extends DateTextFieldProps = DateTextFieldProps, S extends DateTextFieldState<T> = DateTextFieldState<T>> extends React.Component<P, S> {
    /**
     * The style of the element
     * @protected
     */
    protected readonly style: React.CSSProperties;

    /**
     * The constructor
     *
     * @param props the properties
     * @protected
     */
    protected constructor(props: P) {
        super(props);

        // @ts-ignore
        this.state = {
            value: null
        }

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
    public get value(): T {
        return this.state.value;
    }

    /**
     * Set the value
     *
     * @param value the new date
     */
    public set value(value: T) {
        this.setState({
            value: value
        });
    }

    public abstract render(): React.ReactNode;

    /**
     * A function to be called on value change
     *
     * @param value the new value
     * @protected
     */
    protected onChange(value: T): void {
        this.setState({
            value: value
        });
    }
}

/**
 * A date text field
 */
export class DateTextField extends DateTextFieldBase<Date> {
    public render(): React.ReactNode {
        return (
            <div style={this.style}>
                <DatePicker onChange={this.onChange} value={this.state.value}/>
            </div>
        );
    }
}

/**
 * A date text field to select date ranges
 */
export class DateRangeTextField extends DateTextFieldBase<Date[]> {
    public render(): React.ReactNode {
        return (
            <div style={this.style}>
                <DateRangePicker onChange={this.onChange} value={this.state.value}/>
            </div>
        );
    }
}