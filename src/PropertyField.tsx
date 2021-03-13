import React from "react";
import {TextAreaWithAutoComplete} from "./ChipTextArea";
import {database} from "./databaseWrapper";

export interface PropertyFieldProps {
    databaseManager: database.DatabaseManager;
}

export class PropertyField extends React.Component<PropertyFieldProps> {
    private readonly databaseManager: database.DatabaseManager;

    public constructor(props: PropertyFieldProps) {
        super(props);

        this.databaseManager = props.databaseManager;

        this.getPropertyAutoCompleteOptions = this.getPropertyAutoCompleteOptions.bind(this);
        this.getPropertyValueAutoCompleteOptions = this.getPropertyValueAutoCompleteOptions.bind(this);
    }

    public render(): React.ReactNode {
        return (
            <div>
                <TextAreaWithAutoComplete getAutoCompleteOptions={this.getPropertyAutoCompleteOptions}
                                          title="Property"/>
                <TextAreaWithAutoComplete getAutoCompleteOptions={this.getPropertyValueAutoCompleteOptions}
                                          title="Property value"/>
            </div>
        );
    }

    private getPropertyAutoCompleteOptions(input: string): string[] {
        return this.databaseManager.getPropertiesLike(input).map(p => p.name);
    }

    private getPropertyValueAutoCompleteOptions(input: string): string[] {
        return this.databaseManager.getPropertyValuesLike(input).map(p => p.value);
    }
}