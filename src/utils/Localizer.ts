// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionSdkHelper } from "../helper/ActionSdkHelper";

export class Localizer {
    private static jsonObject: { [key: string]: string } = {};

    /**
	 * Get localized Action strings. It will first try to fetch the proper locale strings
	 * i.e. content of string_<language>.json within the Action package. If that is not
	 * found it will fallback to default locale strings i.e. strings_en.json file.
	 * @return promise returning either success or ActionError
	 */
    public static async initialize(): Promise<boolean> {
        let response = await ActionSdkHelper.getLocalizedStrings();
        this.jsonObject = response.success && response.strings;
        return response.success;
    }

    /**
	 * Get localized value of the given string id.
	 * If any id is not found the same will be returned.
	 * @param stringId id of the string to be localized
	 * @param args any arguments which needs to passed
	 */
    public static getString(id: string, ...args: any[]): string {
        if (this.jsonObject && this.jsonObject[id]) {
            return this.getStringInternal(this.jsonObject[id], ...args);
        }
        return this.getStringInternal(id, ...args);
    }

    private static getStringInternal(main: string, ...args: any[]): string {
        let formatted = main;
        for (let i = 0; i < args.length; i++) {
            let regexp = new RegExp("\\{" + i + "\\}", "gi");
            formatted = formatted.replace(regexp, args[i]);
        }
        return formatted;
    }
}
