// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export class Constants {
    // ASCII value for carriage return
    public static readonly CARRIAGE_RETURN_ASCII_VALUE = 13;

    //Set soft expiry for each actionInstance as 30 days after its creation time.
    public static readonly ACTION_INSTANCE_DEFAULT_EXPIRY = Date.now() + (30 * 24 * 60 * 60 * 1000);

    // some OS doesn't support long filenames, so capping the action's title length to this number
    public static readonly ACTION_RESULT_FILE_NAME_MAX_LENGTH: number = 50;

    public static readonly ADD_ITEM_DIV_ID = "add-options-cl";
}
