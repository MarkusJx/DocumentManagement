import React from "react";

/**
 * The sync dialog path element state
 */
interface DirectorySelectorState {
    // The path to display
    path: string;
}

/**
 * The sync dialog path element
 */
export default class DirectorySelector extends React.Component<{}, DirectorySelectorState> {
    /**
     * Create a sync dialog path element
     *
     * @param props the properties
     */
    public constructor(props: {}) {
        super(props);

        this.state = {
            path: null
        };
    }

    /**
     * Get the shown path
     */
    public get path(): string {
        return this.state.path;
    }

    /**
     * Set the path to display
     *
     * @param path the new path
     */
    public set path(path: string) {
        this.setState({
            path: path
        });
    }

    public render(): React.ReactNode {
        return (
            <span className="start-scan-path">
                {this.state.path == null ? "none" : this.state.path}
            </span>
        );
    }
}