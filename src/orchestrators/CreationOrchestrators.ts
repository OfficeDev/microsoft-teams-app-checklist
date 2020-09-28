// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { orchestrator } from "satcheljs";
import getStore from "../store/CreationStore";
import {
    ChecklistColumnType,
    Status,
    ChecklistItemState as checklistItemState
} from "../utils/EnumContainer";
import { ChecklistItemRow } from "../utils/Models";
import {
    initialize,
    callActionInstanceCreationAPI,
    setContext,
    setProgressState,
    setSendingFlag,
} from "../actions/CreationActions";
import { toJS } from "mobx";
import * as actionSDK from "@microsoft/m365-action-sdk";
import { Localizer } from "../utils/Localizer";
import { Utils } from "../utils/Utils";
import {ProgressState} from "../utils/SharedEnum";
import { ActionSdkHelper } from "../helper/ActionSdkHelper";
import { prepareActionInstance, prepareActionInstanceRows, validateChecklistCreation } from "../helper/CreationHelper";
import { Logger } from "../utils/Logger";

let batchReq = [];

orchestrator(initialize, async () => {
    let localizer = await Localizer.initialize();
    let actionContext = await ActionSdkHelper.getContext();
    if (localizer && actionContext.success) {
        setContext(actionContext.context);
        setProgressState(ProgressState.Completed);
    } else {
        setProgressState(ProgressState.Failed);
    }
});

orchestrator(callActionInstanceCreationAPI, () => {
    let actionInstance: actionSDK.Action = prepareActionInstance(toJS(getStore().context), getStore().title);

    createChecklistColumns(actionInstance);
    let actionInstanceRows = createChecklistRows(
        getStore().context.userId,
        actionInstance.id
    );
    if (validateChecklistCreation(actionInstance, actionInstanceRows)) {
        setSendingFlag(true);
        prepareActionInstanceRows(actionInstanceRows);
        //Create Action
        let createAction = new actionSDK.CreateAction.Request(actionInstance);
        batchReq.push(createAction);
        Logger.logInfo("CreateAction - Request: " + JSON.stringify(actionInstance));
        //AddorUpdateRows
        if (
            !Utils.isEmptyObject(actionInstanceRows) &&
            actionInstanceRows.length > 0
        ) {
            let addOrUpdateRowsRequest = new actionSDK.AddOrUpdateActionDataRows.Request(
                actionInstanceRows,
                []
            );
            batchReq.push(addOrUpdateRowsRequest);
        }
        ActionSdkHelper.executeBatchRequest(batchReq);
    }
});

function createChecklistRows(userId: string, actionInstanceId) {
    let actionInstanceRows = [];
    for (let index = 0; index < getStore().items.length; index++) {
        // Only add modified items
        let item = getStore().items[index];
        if (
            item.itemState == checklistItemState.MODIFIED &&
            !Utils.isEmptyString(item.title)
        ) {
            let rowData: ChecklistItemRow = new ChecklistItemRow();
            let actionInstanceRow: actionSDK.ActionDataRow = {
                actionId: actionInstanceId,
                columnValues: JSON.parse(JSON.stringify(rowData)),
            };
            actionInstanceRow.columnValues[
                ChecklistColumnType.checklistItem.toString()
            ] = item.title;
            actionInstanceRow.columnValues[
                ChecklistColumnType.status.toString()
            ] = item.status.toString();
            actionInstanceRow.columnValues[
                ChecklistColumnType.creationUser.toString()
            ] = userId;
            actionInstanceRow.columnValues[
                ChecklistColumnType.creationTime.toString()
            ] = item.creationTime;
            if (item.status.toString() === Status.COMPLETED) {
                actionInstanceRow.columnValues[
                    ChecklistColumnType.completionUser.toString()
                ] = userId;
                actionInstanceRow.columnValues[
                    ChecklistColumnType.completionTime.toString()
                ] = new Date().getTime().toString();
            }
            actionInstanceRows.push(actionInstanceRow);
        }
    }
    return actionInstanceRows;
}

function createChecklistColumns(actionInstance: actionSDK.Action) {
    for (let item in ChecklistColumnType) {
        let checklistCol: actionSDK.ActionDataColumn = {
            name: item,
            valueType: actionSDK.ActionDataColumnValueType.Text,
            displayName: item,
            allowNullValue: true,
        };
        if (
            item.match(ChecklistColumnType.checklistItem) ||
            item.match(ChecklistColumnType.status) ||
            item.match(ChecklistColumnType.creationTime) ||
            item.match(ChecklistColumnType.creationUser)
        ) {
            checklistCol.allowNullValue = false;
        }
        if (item.match(ChecklistColumnType.status)) {
            checklistCol.valueType = actionSDK.ActionDataColumnValueType.SingleOption;
            checklistCol.options = [];
            checklistCol.options.push(statusParams(Status.ACTIVE));
            checklistCol.options.push(statusParams(Status.COMPLETED));
            checklistCol.options.push(statusParams(Status.DELETED));
        }
        if (
            item.match(ChecklistColumnType.completionUser) ||
            item.match(ChecklistColumnType.latestEditUser) ||
            item.match(ChecklistColumnType.creationUser) ||
            item.match(ChecklistColumnType.deletionUser)
        ) {
            checklistCol.valueType = actionSDK.ActionDataColumnValueType.UserId;
        }
        if (
            item.match(ChecklistColumnType.completionTime) ||
            item.match(ChecklistColumnType.latestEditTime) ||
            item.match(ChecklistColumnType.creationTime) ||
            item.match(ChecklistColumnType.deletionTime)
        ) {
            checklistCol.valueType = actionSDK.ActionDataColumnValueType.DateTime;
        }
        actionInstance.dataTables[0].dataColumns.push(checklistCol);
    }
}

function statusParams(state: Status) {
    let optionActive: actionSDK.ActionDataColumnOption = {
        name: state.toString(),
        displayName: state.toString(),
    };
    return optionActive;
}
