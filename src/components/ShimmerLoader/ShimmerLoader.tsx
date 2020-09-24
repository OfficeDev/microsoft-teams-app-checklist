// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import "./Shimmer.scss";

export interface IShimmerLoaderProps {
    /**Profile image circular shimmer will be shown with radius 32px */
    showProfilePic?: boolean;

    /**Shimmer will be shown with 100% height and width given in 0th element in width prop */
    fill?: boolean;

    /**Number of line to be shown */
    lines?: number;

    /**Width of each line and default is 100% if it is not given */
    width?: string[];
}

export class ShimmerLoader extends React.PureComponent<IShimmerLoaderProps> {

    render() {

        let lineShimmer: JSX.Element[] = [];
        if (this.props.lines) {
            for (let i = 0; i < this.props.lines; i++) {
                if (i != 0) {
                    lineShimmer.push(<div className="height20"></div>);
                }
                lineShimmer.push(<div className="comment shim-br animate" style={{
                    width: (this.props.width && this.props.width.length > i && this.props.width[i] ? this.props.width[i] : "100%")
                }}></div>);
            }
        }
        return (
            <div className="card shim-br">
                <div className="wrapper">
                    {this.props.showProfilePic ? <div className="profilePic animate"></div> : null}
                    {this.props.fill ? <div className="comment-full animate" style={{
                        width: (this.props.width && this.props.width.length > 0 && this.props.width[0] ? this.props.width[0] : "100%")
                    }}></div> : lineShimmer}
                </div>
            </div>
        );
    }
}
