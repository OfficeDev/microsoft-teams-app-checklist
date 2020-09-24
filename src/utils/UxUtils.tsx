// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import { Constants } from "../utils/Constants";

export class UxUtils {
    public static getTabKeyProps() {
        return {
            tabIndex: 0,
            role: "button",
            ...this.getClickOnCarriageReturnHandler()
        };
    }

    private static getClickOnCarriageReturnHandler() {
        return {
            onKeyUp: (event: React.KeyboardEvent<HTMLDivElement>) => {
                if ((event.which || event.keyCode) == Constants.CARRIAGE_RETURN_ASCII_VALUE) {
                    (event.currentTarget as HTMLDivElement).click();
                }
            }
        };
    }

    public static renderingForMobile(): boolean {
        let currentHostClientType = document.body.getAttribute("data-hostclienttype");
        return currentHostClientType && (currentHostClientType == "ios" || currentHostClientType == "android");
    }

    public static renderingForiOS(): boolean {
        let currentHostClientType = document.body.getAttribute("data-hostclienttype");
        return currentHostClientType && (currentHostClientType == "ios");
    }
  }
