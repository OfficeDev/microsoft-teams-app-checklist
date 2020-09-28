// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createStore } from "satcheljs";
import { ChecklistItem } from "../utils";
import "../mutator/UpdationMutator";
import "../orchestrators/UpdationOrchestrators";
import * as actionSDK from "@microsoft/m365-action-sdk";
import { ProgressState } from "../utils/SharedEnum";

/**
 * Updation store containing all data required when user edits the checklist.
 */

interface IChecklistUpdationStore {
    context: actionSDK.ActionSdkContext;
    actionInstance: actionSDK.Action;
    actionInstanceRows: actionSDK.ActionDataRow[];
    items: ChecklistItem[];
    shouldValidate: boolean;
    showMoreOptionsList: boolean;
    isChecklistCloseAlertOpen: boolean;
    isChecklistDeleteAlertOpen: boolean;
    isChecklistExpiryAlertOpen: boolean;
    progressState: ProgressState;
    downloadingData: boolean;
    isSending: boolean;
    deletingChecklist: boolean;
    closingChecklist: boolean;
    updatingDueDate: boolean;
    saveChangesFailed: boolean;
    downloadReportFailed: boolean;
    closeChecklistFailed: boolean;
    deleteChecklistFailed: boolean;
    isActionDeleted: boolean;
}

const store: IChecklistUpdationStore = {
    context: null,
    items: [new ChecklistItem()],
    shouldValidate: false,
    showMoreOptionsList: false,
    isChecklistCloseAlertOpen: false,
    actionInstance: null,
    actionInstanceRows: null,
    isChecklistDeleteAlertOpen: false,
    isChecklistExpiryAlertOpen: false,
    progressState: ProgressState.NotStarted,
    downloadingData: false,
    isSending: false,
    deletingChecklist: false,
    closingChecklist: false,
    updatingDueDate: false,
    saveChangesFailed: false,
    downloadReportFailed: false,
    closeChecklistFailed: false,
    deleteChecklistFailed: false,
    isActionDeleted: false,
};

export default createStore<IChecklistUpdationStore>("updationStore", store);
