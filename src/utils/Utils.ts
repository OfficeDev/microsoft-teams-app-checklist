// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as uuid from "uuid";

export namespace Utils {

    export function isValidJson(json: string): boolean {
        try {
            JSON.parse(JSON.stringify(json));
            return true;
        } catch (e) {
            return false;
        }
    }

    export function isEmptyString(str: string): boolean {
        return isEmptyObject(str);
    }

    export function isEmptyObject(obj: any): boolean {
        if (obj == undefined || obj == null) {
            return true;
        }

        let isEmpty = false;

        if (typeof obj === "number" || typeof obj === "boolean") {
            isEmpty = false;
        } else if (typeof obj === "string") {
            isEmpty = obj.trim().length == 0;
        } else if (Array.isArray(obj)) {
            isEmpty = obj.length == 0;
        } else if (typeof obj === "object") {
            if (isValidJson(obj)) {
                isEmpty = JSON.stringify(obj) == "{}";
            }
        }
        return isEmpty;
    }

    export function generateGUID(): string {
        return uuid.v4();
    }

    export function isRTL(locale: string): boolean {
        let rtlLang: string[] = ["ar", "he", "fl"];
        if (locale && rtlLang.indexOf(locale.split("-")[0]) !== -1) {
            return true;
        } else {
            return false;
        }
    }

    export function announceText(text: string) {
        let ariaLiveSpan: HTMLSpanElement = document.getElementById(
            "aria-live-span"
        );
        if (ariaLiveSpan) {
            ariaLiveSpan.innerText = text;
        } else {
            ariaLiveSpan = document.createElement("SPAN");
            ariaLiveSpan.style.cssText =
                "position: fixed; overflow: hidden; width: 0px; height: 0px;";
            ariaLiveSpan.id = "aria-live-span";
            ariaLiveSpan.innerText = "";
            ariaLiveSpan.setAttribute("aria-live", "polite");
            ariaLiveSpan.tabIndex = -1;
            document.body.appendChild(ariaLiveSpan);
            setTimeout(() => {
                ariaLiveSpan.innerText = text;
            }, 50);
        }
    }
}
