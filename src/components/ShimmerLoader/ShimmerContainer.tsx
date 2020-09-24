// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import "./Shimmer.scss";
import { ShimmerLoader, IShimmerLoaderProps } from "./ShimmerLoader";

/**
 * <ShimmerContainer> component that simulates a shimmer effect for the children elements.
 */

export interface IShimmerContainerProps extends IShimmerLoaderProps {
    /**If true or not given, shimmer will be shown else the child componnent will be shown */
    showShimmer?: boolean;
}

export class ShimmerContainer extends React.PureComponent<IShimmerContainerProps> {

    render() {

        if (this.props.showShimmer != undefined && !this.props.showShimmer) {
            return this.props.children;
        }
        return (
            <div className="shimmer-container">
                <div className="container-shimmer-child">
                    {this.props.children}
                </div>
                <div className="container-shimmer-loader">
                    <ShimmerLoader {...this.props} />
                </div>
            </div>
        );
    }
}
