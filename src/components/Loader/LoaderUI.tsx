// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import { Flex, LoaderProps, Loader } from "@fluentui/react-northstar";

export interface ILoaderUIProps extends LoaderProps {
    fill?: boolean;
}

export class LoaderUI extends React.Component<ILoaderUIProps> {

    render() {
        return (
            <Flex fill vAlign="center" hAlign="center" styles={this.props.fill ? {
                position: "absolute"
            } : null}><Loader /></Flex>
        );
    }
}
