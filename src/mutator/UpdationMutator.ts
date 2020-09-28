// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    checklistCloseAlertOpen,
    addActionInstance,
    checklistDeleteAlertOpen,
    checklistExpiryChangeAlertOpen,
    setContext,
    updateSubtitleText,
    setDownloadingData,
    setSendingFlag,
    deleteChecklist,
    closeChecklist,
    saveChangesFailed,
    downloadReportFailed,
    closeChecklistFailed,
    deleteChecklistFailed,
    setIsActionDeleted,
} from "./../actions/UpdationActions";
import { mutator } from "satcheljs";
import {
    Status,
    ChecklistItem,
    ChecklistItemRow,
    ChecklistColumnType,
    checklistItemState,
} from "../utils";
import { getStatus, getCompletedSubtext } from "../helper/UpdationHelper";
import getStore from "../store/UpdationStore";
import {
    addChoice,
    toggleDeleteChoice,
    changeItemCheckedStatus,
    updateChoiceText,
    shouldValidateUI,
    addChecklistItems,
    showMoreOptions,
    setProgressState,
} from "../actions/UpdationActions";
import * as actionSDK from "@microsoft/m365-action-sdk";
import { Utils } from "../utils/Utils";

/**
 * Update view mutators to modify store data on which update view relies
 */

mutator(setProgressState, (msg) => {
    const store = getStore();
    store.progressState = msg.state;
});

mutator(setContext, (msg) => {
    const store = getStore();
    let context: actionSDK.ActionSdkContext = msg.context;
    store.context = context;
});

mutator(addChoice, () => {
    const store = getStore();
    const itemsCopy = [...store.items];
    let item = new ChecklistItem();
    itemsCopy.push(item);
    store.items = itemsCopy;
    resetNetworkError();
});

mutator(toggleDeleteChoice, (msg) => {
    let item: ChecklistItem = msg.item;
    const store = getStore();
    const itemsCopy = [...store.items];
    let index = itemsCopy.indexOf(item);
    if (index > -1) {
        itemsCopy[index] = itemsCopy[index].clone();
        if (itemsCopy[index].status == Status.DELETED) {
            itemsCopy[index].status = Status.ACTIVE;
        } else {
            itemsCopy[index].status = Status.DELETED;
        }
        itemsCopy[index].itemState = checklistItemState.MODIFIED;
    }
    store.items = itemsCopy;
    resetNetworkError();
});

mutator(shouldValidateUI, (msg) => {
    let shouldValidate: boolean = msg.shouldValidate;
    const store = getStore();
    store.shouldValidate = shouldValidate;
});

mutator(deleteChecklist, (msg) => {
    const store = getStore();
    store.deletingChecklist = msg.deletingChecklist;
    resetNetworkError();
});

mutator(closeChecklist, (msg) => {
    const store = getStore();
    store.closingChecklist = msg.closingChecklist;
    resetNetworkError();
});

mutator(setDownloadingData, (msg) => {
    const store = getStore();
    store.downloadingData = msg.downloadingData;
});

mutator(showMoreOptions, (msg) => {
    const store = getStore();
    store.showMoreOptionsList = msg.showMoreOptionsList;
    resetNetworkError();
});

mutator(checklistCloseAlertOpen, (msg) => {
    const store = getStore();
    store.isChecklistCloseAlertOpen = msg.isChecklistCloseAlertOpen;
});

mutator(checklistExpiryChangeAlertOpen, (msg) => {
    const store = getStore();
    store.isChecklistExpiryAlertOpen = msg.isChecklistExpiryAlertOpen;
});

mutator(checklistDeleteAlertOpen, (msg) => {
    const store = getStore();
    store.isChecklistDeleteAlertOpen = msg.isChecklistDeleteAlertOpen;
});

mutator(changeItemCheckedStatus, (msg) => {
    let item: ChecklistItem = msg.item;
    let state: boolean = msg.state;
    const store = getStore();
    const itemsCopy = [...store.items];
    let index = itemsCopy.indexOf(item);
    if (index > -1) {
        itemsCopy[index] = itemsCopy[index].clone();
        if (state) {
            itemsCopy[index].status = Status.COMPLETED;
            itemsCopy[index].completionTime = new Date().getTime().toString();
        } else {
            itemsCopy[index].status = Status.ACTIVE;
            itemsCopy[index].completionTime = "";
        }
        itemsCopy[index].itemState = checklistItemState.MODIFIED;
    }
    store.items = itemsCopy;
    resetNetworkError();
});

mutator(updateChoiceText, (msg) => {
    let item: ChecklistItem = msg.item;
    let text: string = msg.text;
    const store = getStore();
    const itemsCopy = [...store.items];
    let index = itemsCopy.indexOf(item);
    if (index > -1) {
        itemsCopy[index] = itemsCopy[index].clone();
        itemsCopy[index].title = text;
        itemsCopy[index].itemState = checklistItemState.MODIFIED;
    }
    store.items = itemsCopy;
    resetNetworkError();
});

mutator(addActionInstance, (msg) => {
    const store = getStore();
    store.actionInstance = msg.actionInstance;
});

mutator(addChecklistItems, (msg) => {
    let items: actionSDK.ActionDataRow[] = msg.items;
    const store = getStore();
    store.actionInstanceRows = items;
    const itemsCopy = [];
    for (let actionInstanceRow of items) {
        let row: ChecklistItemRow = JSON.parse(
            JSON.stringify(actionInstanceRow.columnValues)
        );
        let state: Status = getStatus(row);
        let item: ChecklistItem = new ChecklistItem(
            row[ChecklistColumnType.checklistItem],
            state,
            "",
            checklistItemState.GENERATED,
            actionInstanceRow.id,
            row[ChecklistColumnType.creationTime],
            actionInstanceRow.id,
            row[ChecklistColumnType.creationUser]
        );
        item.serverStatus = state;
        if (item.status === Status.COMPLETED) {
            item.completedUserId = row[ChecklistColumnType.completionUser];
            item.serverCompletionTime = item.completionTime =
                row[ChecklistColumnType.completionTime];
        }
        itemsCopy.push(item);
    }
    store.items = itemsCopy;
});

mutator(updateSubtitleText, (msg) => {
    let userIdToProfileMap: {
        [key: string]: actionSDK.SubscriptionMember;
    } = msg.userIdToProfileMap;
    const store = getStore();
    const itemsCopy = [...store.items];
    for (let item of itemsCopy) {
        if (
            !Utils.isEmptyString(item.completedUserId) &&
            !Utils.isEmptyString(item.completionTime)
        ) {
            item.subTitle = getCompletedSubtext(
                userIdToProfileMap[item.completedUserId],
                item.completionTime
            );
        }
    }
    store.items = itemsCopy;
});

mutator(setSendingFlag, (msg) => {
    let value: boolean = msg.value;
    const store = getStore();
    store.isSending = value;
    resetNetworkError();
});

mutator(saveChangesFailed, (msg) => {
    let value: boolean = msg.value;
    const store = getStore();
    store.saveChangesFailed = value;
});

mutator(downloadReportFailed, (msg) => {
    let value: boolean = msg.value;
    const store = getStore();
    store.downloadReportFailed = value;
});

mutator(closeChecklistFailed, (msg) => {
    let value: boolean = msg.value;
    const store = getStore();
    store.closeChecklistFailed = value;
});

mutator(deleteChecklistFailed, (msg) => {
    let value: boolean = msg.value;
    const store = getStore();
    store.deleteChecklistFailed = value;
});

mutator(setIsActionDeleted, (msg) => {
    let value: boolean = msg.value;
    const store = getStore();
    store.isActionDeleted = value;
});

function resetNetworkError() {
    const store = getStore();
    store.saveChangesFailed = false;
    store.downloadReportFailed = false;
    store.closeChecklistFailed = false;
    store.deleteChecklistFailed = false;
}
