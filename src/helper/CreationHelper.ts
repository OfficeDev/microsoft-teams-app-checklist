// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as actionSDK from "@microsoft/m365-action-sdk";
import { Utils } from "../utils/Utils";
import { Constants } from "../utils/Constants";
import { showBlankTitleError } from "../actions/CreationActions";

export function prepareActionInstance(actionContext: actionSDK.ActionSdkContext, title: string) {
    let actionInstance: actionSDK.Action = {
        id: Utils.generateGUID(),
        displayName: title,
        expiryTime: Constants.ACTION_INSTANCE_DEFAULT_EXPIRY,
        customProperties: [],
        permissions: {
            [actionSDK.ActionPermission.DataRowsUpdate]: [actionSDK.ActionRole.Member],
        },
        dataTables: [
            {
                name: "TestDataSet",
                rowsVisibility: actionSDK.Visibility.All,
                rowsEditable: true,
                canUserAddMultipleRows: true,
                dataColumns: [],
                attachments: [],
            }
        ]
    };
    let isPropertyExists: boolean = false;

    if (actionInstance.customProperties && actionInstance.customProperties.length > 0) {
        for (let property of actionInstance.customProperties) {
            if (property.name == "Locale") {
                isPropertyExists = true;
            }
        }
    }

    if (!isPropertyExists) {
        actionInstance.customProperties = actionInstance.customProperties || [];
        actionInstance.customProperties.push({
            name: "Locale",
            valueType: actionSDK.ActionPropertyValueType.Text,
            value: actionContext.locale,
        });
    }
    if (Utils.isEmptyString(actionInstance.id)) {
        actionInstance.createTime = Date.now();
    }
    actionInstance.updateTime = Date.now();
    actionInstance.creatorId = actionContext.userId;
    actionInstance.actionPackageId = actionContext.actionPackageId;
    actionInstance.version = actionInstance.version || 1;
    return actionInstance;
}

export function prepareActionInstanceRow(actionInstanceRow: actionSDK.ActionDataRow) {
    if (Utils.isEmptyString(actionInstanceRow.id)) {
        actionInstanceRow.id = Utils.generateGUID();
        actionInstanceRow.createTime = Date.now();
    }
    actionInstanceRow.updateTime = Date.now();
}

export function prepareActionInstanceRows(actionInstanceRows: actionSDK.ActionDataRow[]) {
    for (let actionInstanceRow of actionInstanceRows) {
        prepareActionInstanceRow(actionInstanceRow);
    }
}

export function validateChecklistCreation(actionInstance: actionSDK.Action, actionInstanceRows: actionSDK.ActionDataRow[]): boolean {
    if (
        Utils.isEmptyObject(actionInstance) ||
        actionInstance.dataTables[0].dataColumns == null ||
        Utils.isEmptyString(actionInstance.displayName) ||
        actionInstanceRows.length < 0
    ) {
        if (Utils.isEmptyObject(actionInstance) || Utils.isEmptyString(actionInstance.displayName)) {
            showBlankTitleError(true);
        }
        return false;
    }
    return true;
}
