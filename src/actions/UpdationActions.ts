// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { action } from "satcheljs";
import { ChecklistItem } from "../utils";
import * as actionSDK from "@microsoft/m365-action-sdk";
import { ProgressState } from "../utils/SharedEnum";

export enum ChecklistUpdationAction {
    initialize = "initialize",
    setContext = "setContext",
    updateActionInstance = "updateActionInstance",
    fetchActionInstance = "fetchActionInstance",
    fetchActionInstanceRows = "fetchActionInstanceRows",
    addChoice = "addChoice",
    toggleDeleteChoice = "toggleDeleteChoice",
    showMoreOptions = "showMoreOptions",
    updateChoiceText = "updateChoiceText",
    changeItemCheckedStatus = "changeItemCheckedStatus",
    addActionInstance = "addActionInstance",
    shouldValidateUI = "shouldValidateUI",
    addChecklistItems = "addChecklistItems",
    checklistCloseAlertOpen = "checklistCloseAlertOpen",
    checklistDeleteAlertOpen = "checklistDeleteAlertOpen",
    checklistExpiryChangeAlertOpen = "checklistExpiryChangeAlertOpen",
    updateSubtitleText = "updateSubtitleText",
    fetchActionInstanceRowsUserDetails = "fetchActionInstanceRowsUserDetails",
    downloadingData = "downloadingData",
    setSendingFlag = "setSendingFlag",
    setProgressState = "setProgressState",
    saveChangesFailed = "saveChangesFailed",
    downloadReportFailed = "downloadReportFailed",
    closeChecklistFailed = "closeChecklistFailed",
    deleteChecklistFailed = "deleteChecklistFailed",
    setIsActionDeleted = "setIsActionDeleted",
}

export let initialize = action(ChecklistUpdationAction.initialize);

export let setContext = action(
    ChecklistUpdationAction.setContext,
    (context: actionSDK.ActionSdkContext) => ({ context: context })
);

export let fetchActionInstance = action(
    ChecklistUpdationAction.fetchActionInstance
);

export let fetchActionInstanceRows = action(
    ChecklistUpdationAction.fetchActionInstanceRows
);

export let updateActionInstance = action(
    ChecklistUpdationAction.updateActionInstance
);

export let addChoice = action(ChecklistUpdationAction.addChoice);

export let closeChecklist = action(
    "closeChecklist",
    (closingChecklist: boolean) => ({ closingChecklist: closingChecklist })
);

export let deleteChecklist = action(
    "deleteChecklist",
    (deletingChecklist: boolean) => ({ deletingChecklist: deletingChecklist })
);

export let checklistExpiryChangeAlertOpen = action(
    ChecklistUpdationAction.checklistExpiryChangeAlertOpen,
    (open: boolean) => ({ isChecklistExpiryAlertOpen: open })
);

export let checklistCloseAlertOpen = action(
    ChecklistUpdationAction.checklistCloseAlertOpen,
    (checklistCloseAlertOpen: boolean) => ({
        isChecklistCloseAlertOpen: checklistCloseAlertOpen,
    })
);

export let checklistDeleteAlertOpen = action(
    ChecklistUpdationAction.checklistDeleteAlertOpen,
    (open: boolean) => ({ isChecklistDeleteAlertOpen: open })
);

export let showMoreOptions = action(
    ChecklistUpdationAction.showMoreOptions,
    (showMoreOptions: boolean) => ({ showMoreOptionsList: showMoreOptions })
);

export let toggleDeleteChoice = action(
    ChecklistUpdationAction.toggleDeleteChoice,
    (item: ChecklistItem) => ({ item: item })
);

export let updateChoiceText = action(
    ChecklistUpdationAction.updateChoiceText,
    (item: ChecklistItem, text: string) => ({ item: item, text: text })
);

export let shouldValidateUI = action(
    ChecklistUpdationAction.shouldValidateUI,
    (shouldValidate: boolean) => ({ shouldValidate: shouldValidate })
);

export let changeItemCheckedStatus = action(
    ChecklistUpdationAction.changeItemCheckedStatus,
    (item: ChecklistItem, state: boolean) => ({ item: item, state: state })
);

export let addActionInstance = action(
    ChecklistUpdationAction.addActionInstance,
    (actionInstance: actionSDK.Action) => ({ actionInstance: actionInstance })
);

export let addChecklistItems = action(
    ChecklistUpdationAction.addChecklistItems,
    (items: actionSDK.ActionDataRow[]) => ({ items: items })
);

export let setDownloadingData = action(
    "downloadingData",
    (downloadingData: boolean) => ({ downloadingData: downloadingData })
);

export let updateSubtitleText = action(
    ChecklistUpdationAction.updateSubtitleText,
    (userIdToProfileMap: { [key: string]: actionSDK.SubscriptionMember }) => {
        return { userIdToProfileMap: userIdToProfileMap };
    }
);

export let fetchActionInstanceRowsUserDetails = action(
    ChecklistUpdationAction.fetchActionInstanceRowsUserDetails,
    (userIds: string[]) => ({ userIds: userIds })
);

export let setSendingFlag = action(
    ChecklistUpdationAction.setSendingFlag,
    (value: boolean) => ({ value: value })
);

export let setProgressState = action(ChecklistUpdationAction.setProgressState, (state: ProgressState) => ({
    state: state
}));

export let saveChangesFailed = action(
    ChecklistUpdationAction.saveChangesFailed,
    (value: boolean) => ({ value: value })
);

export let downloadReportFailed = action(
    ChecklistUpdationAction.downloadReportFailed,
    (value: boolean) => ({ value: value })
);

export let closeChecklistFailed = action(
    ChecklistUpdationAction.closeChecklistFailed,
    (value: boolean) => ({ value: value })
);

export let deleteChecklistFailed = action(
    ChecklistUpdationAction.deleteChecklistFailed,
    (value: boolean) => ({ value: value })
);

export let setIsActionDeleted = action(
    ChecklistUpdationAction.setIsActionDeleted,
    (value: boolean) => ({ value: value })
);
