// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { action } from "satcheljs";
import { ChecklistItem } from "../utils";
import * as actionSDK from "@microsoft/m365-action-sdk";
import {ProgressState} from "../utils/SharedEnum";

export enum ChecklistCreationAction {
    initialize = "initialize",
    setContext = "setContext",
    callActionInstanceCreationAPI = "callActionInstanceCreationAPI",
    addChoice = "addChoice",
    deleteChoice = "deleteChoice",
    updateChoiceText = "updateChoiceText",
    changeItemCheckedStatus = "changeItemCheckedStatus",
    updateTitle = "updateTitle",
    setSettings = "setSettings",
    showBlankTitleError = "showBlankTitleError",
    setProgressState = "setProgressState",
    setSendingFlag = "setSendingFlag"
}

export let initialize = action(ChecklistCreationAction.initialize);

export let setContext = action(
    ChecklistCreationAction.setContext,
    (context: actionSDK.ActionSdkContext) => ({ context: context })
);

export let callActionInstanceCreationAPI = action(
    ChecklistCreationAction.callActionInstanceCreationAPI
);

export let addChoice = action(ChecklistCreationAction.addChoice);

export let deleteChoice = action(
    ChecklistCreationAction.deleteChoice,
    (item: ChecklistItem) => ({ item: item })
);

export let showBlankTitleError = action(
    ChecklistCreationAction.showBlankTitleError,
    (blankTitleError: boolean) => ({ blankTitleError: blankTitleError })
);

export let updateTitle = action(
    ChecklistCreationAction.updateTitle,
    (title: string) => ({ title: title })
);

export let updateChoiceText = action(
    ChecklistCreationAction.updateChoiceText,
    (item: ChecklistItem, text: string) => ({ item: item, text: text })
);

export let changeItemCheckedStatus = action(
    ChecklistCreationAction.changeItemCheckedStatus,
    (item: ChecklistItem, state: boolean) => ({ item: item, state: state })
);

export let setProgressState = action(ChecklistCreationAction.setProgressState, (state: ProgressState) => ({
    state: state
}));

export let setSendingFlag = action(
    ChecklistCreationAction.setSendingFlag,
    (value: boolean) => ({ value: value })
);
