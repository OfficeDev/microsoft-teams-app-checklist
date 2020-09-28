// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    addChecklistItems,
    updateSubtitleText,
} from "../actions/UpdationActions";
import getStore from "../store/UpdationStore";
import {
    Status,
    ChecklistColumnType,
    ChecklistItemRow,
    ChecklistItem,
    checklistItemState,
} from "../utils";
import * as actionSDK from "@microsoft/m365-action-sdk";
import { Utils } from "../utils/Utils";
import { Localizer } from "../utils/Localizer";
import { ActionSdkHelper } from "./ActionSdkHelper";
import { Logger } from "../utils/Logger";

export function isChecklistExpired() {
    let actionInstance = getStore().actionInstance;
    if (actionInstance != null && actionInstance.status == actionSDK.ActionStatus.Expired) {
        return true;
    }
    return false;
}

export function isChecklistClosed() {
    let actionInstance = getStore().actionInstance;
    if (actionInstance != null && actionInstance.status == actionSDK.ActionStatus.Closed) {
        return true;
    }
    return false;
}

export function isChecklistCreatedByMe() {
    let actionInstance = getStore().actionInstance;
    if (actionInstance != null && getStore().context != null && actionInstance.creatorId == getStore().context.userId) {
        return true;
    }
    return false;
}

export function getCompletedSubtext(profile: actionSDK.SubscriptionMember, time: string) {
    let subtext = "";
    if (!Utils.isEmptyObject(profile) && !Utils.isEmptyString(time)) {
        let completionTime = getDateString(parseInt(time));
        subtext = Localizer.getString(
            "CompletedBy",
            profile.displayName,
            completionTime
        );
    }
    return subtext;
}

export function getStatus(row: ChecklistItemRow) {
    let state: Status;
    if (row[ChecklistColumnType.status] === Status.ACTIVE) {
        state = Status.ACTIVE;
    } else if (row[ChecklistColumnType.status] === Status.COMPLETED) {
        state = Status.COMPLETED;
    } else {
        state = Status.DELETED;
    }
    return state;
}

export function shouldFetchUserProfiles(items: actionSDK.ActionDataRow[]) {
    let userIds: string[] = [];
    for (let actionInstanceRow of items) {
        let row: ChecklistItemRow = JSON.parse(
            JSON.stringify(actionInstanceRow.columnValues)
        );
        if (row[ChecklistColumnType.status] === Status.COMPLETED) {
            userIds.push(row[ChecklistColumnType.completionUser]);
        }
    }
    return userIds;
}

export function getDateString(expiry: number): string {
    return new Date(expiry).toLocaleDateString(getStore().context.locale, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export async function fetchAllActionInstanceRows(
    pageSize: number = 100,
    rows: actionSDK.ActionDataRow[] = [],
    continuationToken: string = null
) {
    let response = await ActionSdkHelper.getActionDataRows(getStore().context.actionId, null, continuationToken, pageSize);
    if (response.success) {
        //To merge rows from previous call.
        rows = [...rows, ... response.dataRows];
        if (response.continuationToken) {
            let rowResponse = await fetchAllActionInstanceRows(pageSize, rows, response.continuationToken);
            return rowResponse;
        } else {
            let userIds: string[] = shouldFetchUserProfiles(rows);
            addChecklistItems(rows);
            if (userIds.length > 0) {
                let userDetailsResponse = await fetchActionInstanceRowsUserDetailsNow(userIds);
                return userDetailsResponse;
            } else {
                return { success: true };
            }
        }
    } else {
        return response;
    }
}

export async function fetchActionInstanceRowsUserDetailsNow(
    userIds: string[]
) {
    let response = await ActionSdkHelper.getResponderDetails(getStore().context.subscription, userIds);
    if (response.success) {
        if (!Utils.isEmptyObject(response.responders)) {
            let subscriptionMembersMap = createMapping(response.responders);
            updateSubtitleText(subscriptionMembersMap);
        }
        return { success: true };
    } else {
        return response;
    }
}

function createMapping(members: actionSDK.SubscriptionMember[]) {
    let subscriptionMembersMap = {};
    members.forEach((member) => {
        subscriptionMembersMap[member.id.toString()] = member;
        Logger.logInfo("Member details : " + member);
    });
    return subscriptionMembersMap;
}

/**
 * Returns true if user has some unsaved changes in the checklist, false otherwise
 */
export function isChecklistDirty() {
    let actionInstanceRows = updateChecklistRows(getStore().context.userId);
    if (
        !Utils.isEmptyObject(actionInstanceRows) &&
        actionInstanceRows.length !== 0
    ) {
        return true;
    }
    return false;
}

/**
 * Get changed checklist rows
 * @param userId
 */
export function updateChecklistRows(userId: string) {
    let actionInstanceRows = [];
    for (let index = 0; index < getStore().items.length; index++) {

        let item: ChecklistItem = getStore().items[index];
        if (
            item.itemState === checklistItemState.MODIFIED &&
            hasItemChanged(item)
        ) {
            if (
                !Utils.isEmptyString(item.title) ||
                !Utils.isEmptyString(item.rowId)
            ) {
                let rowData: ChecklistItemRow = new ChecklistItemRow();
                let actionInstanceRow: actionSDK.ActionDataRow = {
                    actionId: getStore().context.actionId,
                    columnValues: JSON.parse(JSON.stringify(rowData)),
                };
                if (!Utils.isEmptyString(item.rowId)) {
                    actionInstanceRow.id = item.rowId;
                    actionInstanceRow.columnValues[
                        ChecklistColumnType.creationUser.toString()
                    ] = item.creatorUserId;
                    if (Utils.isEmptyString(item.title)) {
                        item.status = Status.DELETED;
                        item.title = getOldTitle(item);
                    }
                } else {
                    // Add creation details if it is not an update
                    actionInstanceRow.columnValues[
                        ChecklistColumnType.creationUser.toString()
                    ] = userId;
                }

                actionInstanceRow.columnValues[
                    ChecklistColumnType.creationTime.toString()
                ] = item.creationTime;
                actionInstanceRow.columnValues[
                    ChecklistColumnType.checklistItem.toString()
                ] = item.title;
                actionInstanceRow.columnValues[
                    ChecklistColumnType.status.toString()
                ] = item.status.toString();
                if (item.status.toString() === Status.COMPLETED) {
                    actionInstanceRow.columnValues[
                        ChecklistColumnType.completionUser.toString()
                    ] = userId;
                    let completionTime = Utils.isEmptyString(item.completionTime)
                        ? new Date().getTime().toString()
                        : item.completionTime;
                    actionInstanceRow.columnValues[
                        ChecklistColumnType.completionTime.toString()
                    ] = completionTime;
                } else if (item.status.toString() === Status.DELETED) {
                    actionInstanceRow.columnValues[
                        ChecklistColumnType.deletionUser.toString()
                    ] = userId;
                    actionInstanceRow.columnValues[
                        ChecklistColumnType.deletionTime.toString()
                    ] = new Date().getTime().toString();
                }
                actionInstanceRow.columnValues[
                    ChecklistColumnType.latestEditUser.toString()
                ] = userId;
                actionInstanceRow.columnValues[
                    ChecklistColumnType.latestEditTime.toString()
                ] = new Date().getTime().toString();
                actionInstanceRows.push(actionInstanceRow);
            }
        }
    }
    return actionInstanceRows;
}

/**
 * To check if the items received from server either differs in text or status from the current items on the UI
 * @param item
 */
function hasItemChanged(item: ChecklistItem) {
    if (!Utils.isEmptyString(item.rowId)) {
        let actionInstanceRow = getStore().actionInstanceRows.find(
            (x) => x.id === item.rowId
        );
        if (!Utils.isEmptyObject(actionInstanceRow)) {
            let row: ChecklistItemRow = JSON.parse(
                JSON.stringify(actionInstanceRow.columnValues)
            );
            let originalTitle: string = row[ChecklistColumnType.checklistItem];
            let state: Status = getStatus(row);
            if (item.title === originalTitle && item.status === state) {
                return false;
            }
        }
    } else if (item.status === Status.DELETED) {
        // If the row is new and user has added it and deleted it, don't send it to server
        return false;
    }
    return true;
}

/**
 *  Returns the old title fetched via network in the beginning
 * @param item
 */
function getOldTitle(item: ChecklistItem) {
    let actionInstanceRow = getStore().actionInstanceRows.find(
        (x) => x.id === item.rowId
    );
    if (!Utils.isEmptyObject(actionInstanceRow)) {
        let row: ChecklistItemRow = JSON.parse(
            JSON.stringify(actionInstanceRow.columnValues)
        );
        return row[ChecklistColumnType.checklistItem];
    }
}

export function getActionInstanceProperty(
    actionInstance: actionSDK.Action,
    propertyName: string
): actionSDK.ActionProperty {
    let customProperties = actionInstance.customProperties;
    if (
        customProperties &&
        customProperties.length > 0
    ) {
        for (let property of actionInstance.customProperties) {
            if (property.name == propertyName) {
                return property;
            }
        }
    }
    return null;
}
