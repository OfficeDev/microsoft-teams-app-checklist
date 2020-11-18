// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    closeChecklist,
    checklistCloseAlertOpen,
    deleteChecklist,
    checklistDeleteAlertOpen,
    setContext,
    fetchActionInstanceRowsUserDetails,
    setDownloadingData,
    setSendingFlag,
    saveChangesFailed,
    downloadReportFailed,
    closeChecklistFailed,
    deleteChecklistFailed,
    setIsActionDeleted,
} from "./../actions/UpdationActions";

import { orchestrator } from "satcheljs";
import {
    initialize,
    fetchActionInstance,
    fetchActionInstanceRows,
    addActionInstance,
    updateActionInstance,
    setProgressState,
} from "../actions/UpdationActions";
import getStore from "../store/UpdationStore";
import { fetchAllActionInstanceRows, updateChecklistRows } from "../helper/UpdationHelper";
import {
    fetchActionInstanceRowsUserDetailsNow,
} from "../helper/UpdationHelper";

import * as actionSDK from "@microsoft/m365-action-sdk";
import { Utils } from "../utils/Utils";
import { Localizer } from "../utils/Localizer";
import { ProgressState } from "../utils/SharedEnum";
import { Constants } from "../utils/Constants";
import { ActionSdkHelper } from "../helper/ActionSdkHelper";


export enum HttpStatusCode {
    Created = 201,
    Unauthorized = 401,
    NotFound = 404,
}
const handleErrorResponse = (error: actionSDK.ApiError) => {
    if (error && error.code == "404") {
        setIsActionDeleted(true);
    }
};

const handleError = (error: actionSDK.ApiError, requestType: string) => {
    handleErrorResponse(error);
    setProgressState(ProgressState.Failed);
};

orchestrator(initialize, async () => {
    let actionContext = await ActionSdkHelper.getContext();
    if (actionContext.success) {
        setContext(actionContext.context);
        let localizer = await Localizer.initialize();
        let actionInstance = await fetchActionInstanceNow();
        let actionInstanceRows = await fetchAllActionInstanceRows();

        if (localizer && actionInstance.success && actionInstanceRows.success) {
            setProgressState(ProgressState.Completed);
        } else {
            setProgressState(ProgressState.Failed);
        }
    } else {
        setProgressState(ProgressState.Failed);
    }
});

async function fetchActionInstanceNow() {
    let actionInstance = await ActionSdkHelper.getActionInstance(getStore().context.actionId);
    if (actionInstance.success) {
        addActionInstance(actionInstance.action);
        return { success: true };
    } else {
        handleErrorResponse(actionInstance.error);
        return actionInstance;
    }
}

orchestrator(fetchActionInstance, fetchActionInstanceNow);

orchestrator(fetchActionInstanceRows, fetchAllActionInstanceRows);

orchestrator(fetchActionInstanceRowsUserDetails, (msg) => {
    fetchActionInstanceRowsUserDetailsNow(msg.userIds);
});

orchestrator(updateActionInstance, async () => {
    let addRows = [];
    let updateRows = [];

    let actionInstanceRows = updateChecklistRows(getStore().context.userId);
    if (
        Utils.isEmptyObject(actionInstanceRows) ||
        actionInstanceRows.length == 0
    ) {
        await ActionSdkHelper.closeCardView();
    } else {
        setSendingFlag(true);
        //Prepare Request arguments
        actionInstanceRows.forEach((row) => {
            if (Utils.isEmptyString(row.id)) {
                row.id = Utils.generateGUID();
                row.createTime = Date.now();
                row.updateTime = Date.now();
                addRows.push(row);
            } else {
                row.updateTime = Date.now();
                updateRows.push(row);
            }
        });

        Utils.announceText(Localizer.getString("SavingChanges"));
        let response = await ActionSdkHelper.addOrUpdateDataRows(addRows, updateRows);
        if (response.success) {
            setSendingFlag(false);
            if (response.addOrUpdateResponse.success) {
                Utils.announceText(Localizer.getString("Saved"));
                await ActionSdkHelper.closeCardView();
            } else {
                Utils.announceText(Localizer.getString("Failed"));
                saveChangesFailed(true);
            }
        } else {
            Utils.announceText(Localizer.getString("Failed"));
            setSendingFlag(false);
            saveChangesFailed(true);
            handleErrorResponse(response.error);
        }
    }
});

orchestrator(setDownloadingData, async (msg) => {
    try {
        if (msg.downloadingData) {
            let downloadDataResponse = await ActionSdkHelper.downloadResponseAsCSV(getStore().context.actionId,
                Localizer.getString("ChecklistResult", getStore().actionInstance.displayName).substring(0, Constants.ACTION_RESULT_FILE_NAME_MAX_LENGTH));
            setDownloadingData(false);
            if (!downloadDataResponse.success) {
                downloadReportFailed(true);
            }
        }
    } catch (error) {
        setDownloadingData(false);
        downloadReportFailed(true);
        handleErrorResponse(error);
    }
});

orchestrator(closeChecklist, async (msg) => {
    let addRows = [];
    let updateRows = [];
    // if the checklist has unsaved changes and save first before closing
    let actionInstanceRows = updateChecklistRows(getStore().context.userId);
    if (
        Utils.isEmptyObject(actionInstanceRows) ||
        actionInstanceRows.length == 0
    ) {
        closeChecklistInternal(msg);
    } else {
        //Prepare Request arguments
        actionInstanceRows.forEach((row) => {
            if (Utils.isEmptyString(row.id)) {
                row.id = Utils.generateGUID();
                row.createTime = Date.now();
                row.updateTime = Date.now();
                addRows.push(row);
            } else {
                row.updateTime = Date.now();
                updateRows.push(row);
            }
        });
        Utils.announceText(Localizer.getString("SavingChanges"));
        let response = await ActionSdkHelper.addOrUpdateDataRows(addRows, updateRows);
        if (response.success) {
            response.addOrUpdateResponse.success ? closeChecklistInternal(msg) : closeChecklistFailed(true);
        } else {
            closeChecklistFailed(true);
            handleErrorResponse(response.error);
        }
    }
});

orchestrator(deleteChecklist, async (msg) => {
    if (msg && msg.deletingChecklist) {
        let response = await ActionSdkHelper.deleteActionInstance(getStore().context.actionId);
        if (response.success) {
            checklistDeleteAlertOpen(false);
            await ActionSdkHelper.closeCardView();
            if (!response.deleteResponse.success) {
                deleteChecklistFailed(true);
            }
        } else {
            deleteChecklistFailed(true);
            handleErrorResponse(response.error);
        }
    }
});

async function closeChecklistInternal(msg: { closingChecklist: boolean }) {
    if (msg && msg.closingChecklist) {
        let actionInstanceUpdateInfo: actionSDK.ActionUpdateInfo = {
            id: getStore().context.actionId,
            version: getStore().actionInstance.version,
            status: actionSDK.ActionStatus.Closed,
        };
        let response = await ActionSdkHelper.updateActionInstanceStatus(actionInstanceUpdateInfo);
        if (response.success) {
            checklistCloseAlertOpen(false);
            if (response.updateResponse.success) {
                await ActionSdkHelper.closeCardView();
            } else {
                closeChecklistFailed(true);
            }
        } else {
            closeChecklistFailed(true);
            handleErrorResponse(response.error);
        }
    }
}
