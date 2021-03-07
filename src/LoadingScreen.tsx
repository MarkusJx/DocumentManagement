import React from "react";

class LoadingScreen extends React.Component {
    render(): React.ReactNode {
        return (
            <div>
                <div className="mdc-linear-progress mdc-linear-progress--indeterminate" role="progressbar">
                    <div className="mdc-linear-progress__buffer">
                        <div className="mdc-linear-progress__buffer-bar"/>
                        <div className="mdc-linear-progress__buffer-dots"/>
                    </div>
                    <div className="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
                        <span className="mdc-linear-progress__bar-inner"/>
                    </div>
                    <div className="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
                        <span className="mdc-linear-progress__bar-inner"/>
                    </div>
                </div>
            </div>
        );
    }
}