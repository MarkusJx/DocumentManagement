import React from "react";
import {ChipTextAreaWithAutoComplete, TextArea} from "./ChipTextArea";
import {Checkbox, OutlinedButton} from "./MDCWrapper";
import {database, PropertyMap} from "./databaseWrapper";
import {PropertySetter} from "./PropertyField";
import MDCCSSProperties from "./MDCCSSProperties";

export interface SearchBoxProps {
    databaseManager: database.DatabaseManager;
    searchStart: () => void;
}

export class SearchBox extends React.Component<SearchBoxProps> {
    private filenameTextArea: TextArea;
    private exact_match_checkbox: Checkbox;
    private propertySetter: PropertySetter;
    private chipTextArea: ChipTextAreaWithAutoComplete;
    private readonly databaseManager: database.DatabaseManager;
    private readonly searchStart: () => void;

    public constructor(props: SearchBoxProps) {
        super(props);

        this.databaseManager = props.databaseManager;
        this.searchStart = props.searchStart.bind(this);

        this.filenameTextArea = null;
        this.exact_match_checkbox = null;
        this.propertySetter = null;
        this.chipTextArea = null;

        this.tagExists = this.tagExists.bind(this);
        this.getTagOptions = this.getTagOptions.bind(this);
    }

    public async getFilter(): Promise<database.DocumentFilter> {
        const filters: database.filters.DocumentFilterBase[] = [];
        if (this.filenameTextArea.value.length > 0) {
            const filename: string = this.filenameTextArea.value;
            const exactMatch: boolean = this.exact_match_checkbox.checked;
            filters.push(await database.filters.FilenameFilter.create(filename, exactMatch));
        }

        if (this.propertySetter.propertyValues.length > 0) {
            const properties: string[] = this.propertySetter.propertyValues
                .flatMap(v => [v.propertyName, v.propertyValue]);

            const map: PropertyMap = PropertyMap.of(...properties);
            filters.push(await database.filters.PropertyFilter.create(map));
        }

        if (this.chipTextArea.chipValues.length > 0) {
            const tags: string[] = this.chipTextArea.chipValues;
            filters.push(await database.filters.TagFilter.create(...tags));
        }

        return await database.DocumentFilter.create(...filters);
    }

    public render(): React.ReactNode {
        const style: MDCCSSProperties = {
            "--mdc-theme-primary": "#4a6eff"
        }

        const exact_match_container_style: React.CSSProperties = {
            display: "grid",
            gridTemplateColumns: "max-content auto"
        };

        const exact_match_text_style: React.CSSProperties = {
            fontFamily: "sans-serif",
            margin: "auto"
        };

        return (
            <div style={style}>
                <TextArea title={"File name"} ref={e => this.filenameTextArea = e}/>
                <div style={exact_match_container_style}>
                    <div style={exact_match_text_style}>
                        Exact match
                    </div>
                    <Checkbox ref={e => this.exact_match_checkbox = e}/>
                </div>
                <PropertySetter databaseManager={this.databaseManager} ref={e => this.propertySetter = e}/>
                <ChipTextAreaWithAutoComplete getAutoCompleteOptions={this.getTagOptions} title={"Select tags"}
                                              chipValueExists={this.tagExists}
                                              chipTooltipText={"This tag does not exist. No documents will be found."}
                                              ref={e => this.chipTextArea = e}/>
                <OutlinedButton text={"Search"} onClick={this.searchStart}/>
            </div>
        );
    }

    private tagExists(value: string): boolean {
        return this.databaseManager.tagExists(value);
    }

    private getTagOptions(value: string): string[] {
        return this.databaseManager.getTagsLike(value).map(t => t.name);
    }
}