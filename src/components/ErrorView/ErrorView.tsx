// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import "./ErrorView.scss";
import {
    Flex,
    Text,
    Button
} from "@fluentui/react-northstar";
import { Utils } from "../../utils/Utils";
import { ActionSdkHelper } from "../../helper/ActionSdkHelper";

export interface IErrorViewProps {
    image?: string;
    title: string;
    subtitle?: string;
    buttonTitle: string;
}

export class ErrorView extends React.Component<IErrorViewProps, any> {

    render() {

        let image: string = this.props.image;
        if (Utils.isEmptyString(this.props.image)) {
            image = "./images/genericError.png";
        }
        return (
            <Flex column gap="gap.large" fill className="body-container display-flex" hAlign="center" vAlign="center">
                <Flex column className="error-view-container">
                    <img src={image} className="error-view-image" />
                    <Text className="error-view-title">{this.props.title}</Text>
                    {!Utils.isEmptyString(this.props.subtitle) && <Text className="error-view-subtitle">{this.props.subtitle}</Text>}
                </Flex>
                <Button
                    primary
                    content={this.props.buttonTitle}
                    className="error-view-button"
                    onClick={() => {
                        ActionSdkHelper.closeCardView();
                    }}
                />
            </Flex>
        );
    }
}
