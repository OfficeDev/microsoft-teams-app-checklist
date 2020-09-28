// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { mutator } from "satcheljs";
import {
    addChoice,
    deleteChoice,
    showBlankTitleError,
    changeItemCheckedStatus,
    updateChoiceText,
    updateTitle,
    setContext,
    setProgressState,
    setSendingFlag,
} from "../actions/CreationActions";
import {
    Status,
    ChecklistItem,
    checklistItemState,
} from "../utils";
import getStore from "../store/CreationStore";
import * as actionSDK from "@microsoft/m365-action-sdk";
import { Utils } from "../utils/Utils";

mutator(setProgressState, (msg) => {
    const store = getStore();
    store.progressState = msg.state;
});

/**
 * Creation view mutators to modify store data on which create view relies
 */

mutator(setContext, (msg) => {
    const store = getStore();
    store.context = msg.context;
    if (!Utils.isEmptyObject(store.context.lastSessionData)) {
        //Store data to retrieve on card preview screen.
        const lastSessionData = store.context.lastSessionData;
        const actionInstance: actionSDK.Action = lastSessionData.action;
        const actionInstanceRows = lastSessionData.dataRows;

        const itemsCopy: ChecklistItem[] = [];
        if (actionInstanceRows && actionInstanceRows.length > 0) {
            actionInstanceRows.forEach((rowItem, index) => {
                let title = rowItem.columnValues["checklistItem"];
                let state: Status;
                if (rowItem.columnValues["status"] == Status.ACTIVE) {
                    state = Status.ACTIVE;
                }
                if (rowItem.columnValues["status"] == Status.COMPLETED) {
                    state = Status.COMPLETED;
                }
                let item: ChecklistItem = new ChecklistItem(
                    title,
                    state,
                    "",
                    checklistItemState.MODIFIED,
                    "",
                    (new Date().getTime() + index).toString(),
                    "",
                    ""
                );
                itemsCopy.push(item);
            });
            getStore().items = itemsCopy;
        }
        getStore().title = actionInstance.displayName;
    }
});

mutator(addChoice, () => {
    const store = getStore();
    const itemsCopy = [...store.items];
    let item = new ChecklistItem();
    itemsCopy.push(item);
    store.items = itemsCopy;
});

mutator(deleteChoice, (msg) => {
    let item: ChecklistItem = msg.item;
    const store = getStore();
    store.items = store.items.filter((x) => x !== item);
});

mutator(showBlankTitleError, (msg) => {
    let blankTitleError: boolean = msg.blankTitleError;
    const store = getStore();
    store.showBlankTitleError = blankTitleError;
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
        } else {
            itemsCopy[index].status = Status.ACTIVE;
        }
        itemsCopy[index].itemState = checklistItemState.MODIFIED;
    }
    store.items = itemsCopy;
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
});

mutator(updateTitle, (msg) => {
    let title: string = msg.title;
    const store = getStore();
    store.showBlankTitleError = false;
    store.title = title;
});

mutator(setSendingFlag, (msg) => {
    let value: boolean = msg.value;
    const store = getStore();
    store.isSending = value;
});
