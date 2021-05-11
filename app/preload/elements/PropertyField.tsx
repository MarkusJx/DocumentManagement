import React from "react";
import ReactDOM from "react-dom";
import {MDCRipple} from '@material/ripple';
import {Arrays, database} from "../databaseWrapper";
import {OutlinedTextFieldWithAutoComplete} from "./MDCWrapper";
import {getLogger} from "log4js";
import constants from "../util/constants";
import javaTypes from "../javaTypes";

const logger = getLogger();

/**
 * The properties for the {@link PropertyField}
 */
export interface PropertyFieldProps {
    // The property name to write to the field
    propertyName?: string;
    // The property value to write to the field
    propertyValue?: string;
}

/**
 * An element containing a text field for a property name and a text field for a property value
 */
export class PropertyField extends React.Component<PropertyFieldProps> {
    /**
     * The pre-set property name
     * @private
     */
    private readonly _propertyName: string;

    /**
     * The pre-set property value
     * @private
     */
    private readonly _propertyValue: string;

    /**
     * The property name text area
     * @private
     */
    private _propertyNameTextArea: OutlinedTextFieldWithAutoComplete;

    /**
     * The property value text area
     * @private
     */
    private _propertyValueTextArea: OutlinedTextFieldWithAutoComplete;

    /**
     * Create a property field
     *
     * @param props the properties
     */
    public constructor(props: PropertyFieldProps) {
        super(props);

        this._propertyName = props.propertyName;
        this._propertyValue = props.propertyValue;

        this._propertyNameTextArea = null;
        this._propertyValueTextArea = null;

        this.valueAutocompleteClick = this.valueAutocompleteClick.bind(this);
        this.propertyAutocompleteClick = this.propertyAutocompleteClick.bind(this);
    }

    /**
     * Get the current property name
     */
    public get propertyName(): string {
        return this._propertyNameTextArea.value;
    }

    /**
     * Ger the current property value
     */
    public get propertyValue(): string {
        return this._propertyValueTextArea.value;
    }

    /**
     * Get the property name auto complete options
     *
     * @param input the current input value
     * @private
     */
    private static getPropertyAutoCompleteOptions(input: string): string[] {
        try {
            return constants.databaseManager.getPropertiesLikeSync(input).toArraySync().map(p => p.name);
        } catch (e) {
            logger.error("An error occurred while getting all properties like a value:", e);
            return [];
        }
    }

    /**
     * Get the property value auto complete options
     *
     * @param input the current input value
     * @private
     */
    private static getPropertyValueAutoCompleteOptions(input: string): string[] {
        try {
            return constants.databaseManager.getPropertyValuesLikeSync(input).toArraySync().map(p => p.value);
        } catch (e) {
            logger.error("An error occurred while getting all property values like a value:", e);
            return [];
        }
    }

    public render(): React.ReactNode {
        const autoCompleteStyle: React.CSSProperties = {
            marginTop: '-19px'
        };

        return (
            <div>
                <OutlinedTextFieldWithAutoComplete getAutoCompleteOptions={PropertyField.getPropertyAutoCompleteOptions}
                                                   title="Property name" value={this._propertyName}
                                                   ref={e => this._propertyNameTextArea = e} labelId={"property-name"}
                                                   autoCompleteStyle={autoCompleteStyle}
                                                   onAutoCompleteOptionClick={this.propertyAutocompleteClick}/>
                <OutlinedTextFieldWithAutoComplete
                    getAutoCompleteOptions={PropertyField.getPropertyValueAutoCompleteOptions}
                    title="Property value" value={this._propertyValue}
                    ref={e => this._propertyValueTextArea = e} onAutoCompleteOptionClick={this.valueAutocompleteClick}
                    labelId={"property-value"} autoCompleteStyle={autoCompleteStyle}/>
            </div>
        );
    }

    public componentDidMount(): void {
        this._propertyNameTextArea.textArea.textField.listen('focusout', async () => {
            try {
                if (this._propertyNameTextArea.value.trim().length > 0) {
                    if (await constants.databaseManager.propertyExists(this._propertyNameTextArea.value.trim())) {
                        this._propertyNameTextArea.textArea.textField.helperTextContent = "";
                    } else {
                        this._propertyNameTextArea.textArea.textField.helperTextContent = "The property does not exist";
                    }
                } else {
                    this._propertyNameTextArea.textArea.textField.helperTextContent = "";
                }
            } catch (e) {
                logger.error("The focus out listener for the property name failed:", e);
            }
        });

        this._propertyValueTextArea.textArea.textField.listen('focusout', async () => {
            try {
                if (this._propertyValueTextArea.value.trim().length > 0) {
                    if (await constants.databaseManager.propertyValueExists(this._propertyValueTextArea.value.trim())) {
                        this._propertyValueTextArea.textArea.textField.helperTextContent = "";
                    } else {
                        this._propertyValueTextArea.textArea.textField.helperTextContent = "The property value does not exist";
                    }
                } else {
                    this._propertyValueTextArea.textArea.textField.helperTextContent = "";
                }
            } catch (e) {
                logger.error("The focus out listener for the property value failed:", e);
            }
        });
    }

    private valueAutocompleteClick(): void {
        this._propertyValueTextArea.textArea.textField.helperTextContent = "";
    }

    private propertyAutocompleteClick(): void {
        this._propertyNameTextArea.textArea.textField.helperTextContent = "";
    }
}

/**
 * Filter out non-unique values from an array.
 * Source: https://stackoverflow.com/a/14438954
 *
 * @param value the current value
 * @param index the current index
 * @param self the array
 */
function unique<T>(value: T, index: number, self: Array<T>): boolean {
    return self.lastIndexOf(value) === index;
}

/**
 * Filter out null values from an array
 *
 * @param value the current value
 */
function notNull<T>(value: T): boolean {
    return value !== null && value !== undefined;
}

/**
 * The property setter properties
 */
export interface PropertySetterProps {
}

/**
 * A property setter
 */
export class PropertySetter extends React.Component<PropertySetterProps> {
    /**
     * The current property text fields
     * @private
     */
    private readonly _propertyFields: PropertyField[];

    /**
     * The if for the next property field
     * @private
     */
    private _nextId: number;

    /**
     * Create a PropertySetter
     *
     * @param props the properties
     */
    public constructor(props: PropertySetterProps) {
        super(props);

        this._propertyValues = [];
        this._propertyFields = [];
        this._nextId = 0;

        this.addElement = this.addElement.bind(this);
    }

    /**
     * The property value sets
     * @private
     */
    private _propertyValues: database.PropertyValueSet[];

    /**
     * Get the property values
     *
     * @return the property value sets
     */
    public get propertyValues(): javaTypes.List<database.PropertyValueSet> {
        const list = this._propertyFields
            .filter(unique)
            .filter(notNull)
            .filter(v => v.propertyName.length > 0 && v.propertyValue.length > 0)
            .map(f => new database.PropertyValueSet(new database.Property(f.propertyName), new database.PropertyValue(f.propertyValue)));

        return Arrays.asListSync(list);
    }

    /**
     * Set the property values
     *
     * @param values the values to set
     */
    public set propertyValues(values: javaTypes.List<database.PropertyValueSet>) {
        this._propertyValues = values.toArraySync();
        this.forceUpdate();
    }

    /**
     * Clear this property text fields
     */
    public clear(): void {
        this._propertyFields.length = 0;
        this._propertyValues.length = 0;

        this.forceUpdate();
    }

    public render(): React.ReactNode {
        return (
            <div>
                {this.getFields()}
                <button className="mdc-button themed-button" onClick={this.addElement}>
                    <span className="mdc-button__ripple"/>
                    <span className="mdc-button__label">Create new</span>
                </button>
            </div>
        );
    }

    public componentDidMount(): void {
        const $this = ReactDOM.findDOMNode(this) as Element;
        const buttons = $this.getElementsByClassName('mdc-button') as HTMLCollectionOf<HTMLButtonElement>;

        for (const button of buttons) {
            MDCRipple.attachTo(button);
        }
    }

    /**
     * Get the property text fields
     * @private
     */
    private getFields(): React.ReactNode {
        this._propertyFields.length = 0;

        // If propertyValues is empty, create one empty property value set
        if (this._propertyValues.length <= 0) {
            this._propertyValues.push(new database.PropertyValueSet());
        }

        return (
            this._propertyValues.map((pv: database.PropertyValueSet) => (
                <div key={pv.property.name + '-' + pv.property.name + '-' + this._nextId++}
                     className="property-field__container">
                    <PropertyField propertyName={pv.property.name} propertyValue={pv.propertyValue.value}
                                   ref={e => this._propertyFields.push(e)}/>
                    <button className="mdc-button themed-button property-field__remove-button"
                            onClick={this.removeElement.bind(this, pv)}>
                        <span className="mdc-button__ripple"/>
                        <span className="mdc-button__label">remove</span>
                    </button>
                </div>
            ))
        );
    }

    /**
     * Remove an element
     *
     * @param value the value of the element to remove
     * @private
     */
    private removeElement(value: database.PropertyValueSet): void {
        this._propertyValues.splice(this._propertyValues.indexOf(value), 1);
        this.forceUpdate();
    }

    /**
     * Add an element
     * @private
     */
    private addElement() {
        const values: database.PropertyValueSet[] = this.propertyValues.toArraySync();

        values.push(new database.PropertyValueSet(new database.Property(""), new database.PropertyValue("")));
        this._propertyValues = values.filter(unique);
        this.forceUpdate();
    }
}