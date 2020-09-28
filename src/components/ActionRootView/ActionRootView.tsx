// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import "./ActionRootView.scss";
import { Provider, teamsTheme, teamsDarkTheme, teamsHighContrastTheme, ThemePrepared } from "@fluentui/react-northstar";
import * as actionSDK from "@microsoft/m365-action-sdk";
import { Utils } from "../../utils/Utils";
import { ActionSdkHelper } from "../../helper/ActionSdkHelper";

interface IActionRootViewState {
    hostContext: actionSDK.ActionSdkContext;
}
export class ActionRootView extends React.Component<any, IActionRootViewState> {

    constructor(props: any) {
        super(props);
        this.state = {
            hostContext: null,
        };
    }

    async componentWillMount() {
        let response = await ActionSdkHelper.getContext();
        if (response.success) {
            this.setState({
                hostContext: response.context,
            });
        }
    }

    render() {
        if (!this.state.hostContext) {
            return null;
        }

        document.body.className = this.getClassNames();
        document.body.setAttribute(
            "data-hostclienttype",
            this.state.hostContext.hostClientType
        );

        let isRTL = Utils.isRTL(this.state.hostContext.locale);
        document.body.dir = isRTL ? "rtl" : "ltr";

        Utils.announceText("");

        return (
            <Provider
                theme={this.getTheme()}
                rtl={isRTL}
            >
                {this.props.children}
            </Provider>
        );
    }

    private getTheme(): ThemePrepared {
        switch (this.state.hostContext.theme) {
            case "contrast":
                return teamsHighContrastTheme;

            case "dark":
                return teamsDarkTheme;

            default:
                return teamsTheme;
        }
    }

    private getClassNames(): string {
        let classNames: string[] = [];

        switch (this.state.hostContext.theme) {
            case "contrast":
                classNames.push("theme-contrast");
                break;
            case "dark":
                classNames.push("theme-dark");
                break;
            default:
                classNames.push("theme-default");
                break;
        }

        if (this.state.hostContext.hostClientType == "android") {
            classNames.push("client-mobile");
            classNames.push("client-android");
        } else if (this.state.hostContext.hostClientType == "ios") {
            classNames.push("client-mobile");
            classNames.push("client-ios");
        } else if (this.state.hostContext.hostClientType == "web") {
            classNames.push("desktop-web");
            classNames.push("web");
        } else if (this.state.hostContext.hostClientType == "desktop") {
            classNames.push("desktop-web");
            classNames.push("desktop");
        } else {
            classNames.push("desktop-web");
        }

        return classNames.join(" ");
    }
}
