// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DayOfWeek } from "office-ui-fabric-react/lib/Calendar";

export class Constants {
    // ASCII value for carriage return
    public static readonly CARRIAGE_RETURN_ASCII_VALUE = 13;

    public static readonly ACTION_INSTANCE_INDEFINITE_EXPIRY = -1;
  
    // some OS doesn't support long filenames, so capping the action's title length to this number
    public static readonly ACTION_RESULT_FILE_NAME_MAX_LENGTH: number = 50;

    public static readonly ADD_ITEM_DIV_ID = "add-options-cl";
}
