// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as actionSDK from "@microsoft/m365-action-sdk";
import { Logger } from "../utils/Logger";

export class ActionSdkHelper {

    /*
    * @desc Gets the localized strings in which the app is rendered
    */
    public static async getLocalizedStrings() {
        let request = new actionSDK.GetLocalizedStrings.Request();
        try {
            let response = await actionSDK.executeApi(request) as actionSDK.GetLocalizedStrings.Response;
            return { success: true, strings: response.strings };
        } catch (error) {
            Logger.logError(`fetchLocalization failed, Error: ${error.category}, ${error.code}, ${error.message}`);
            return { success: false };
        }
    }

    /*
    * @desc Service Request to create new Action Instance
    * @param {actionSDK.Action} action instance which need to get created
    */
    public static async createActionInstance(action: actionSDK.Action) {
        try {
            let createRequest = new actionSDK.CreateAction.Request(action);
            let createResponse = await actionSDK.executeApi(createRequest) as actionSDK.CreateAction.Response;
            Logger.logInfo("CreateAction -Response " + JSON.stringify(createResponse));
        } catch (error) {
            Logger.logError("CreateAction Error: " + JSON.stringify(error));
        }
    }

    /*
    * function to execute batch request
    * @param batchRequestArray Array of request to be executed in batch
    */
    public static async executeBatchRequest(batchRequestArray) {
        let batchRequest = new actionSDK.BaseApi.BatchRequest(batchRequestArray);
        try {
            let batchResponse = await actionSDK.executeBatchApi(batchRequest);
            Logger.logInfo("BatchResponse: " + JSON.stringify(batchResponse));
            return batchResponse;
        } catch (error) {
            Logger.logError("Console log: Error: " + JSON.stringify(error));
            return;
        }
    }

    /*
    *   @desc Service API Request for getting the actionContext
    */
    public static async getContext() {
        try {
            let response = await actionSDK.executeApi(new actionSDK.GetContext.Request()) as actionSDK.GetContext.Response;
            return { success: true, context: response.context };
        } catch (error) {
            Logger.logError("getContext Error: " + JSON.stringify(error));
            return { success: false, error: error };
        }
    }

    /*
    *   @desc Service API Request for getting the actionInstance
    *   @param context - actionInstance context: actionSDK.ActionSdkContext
    */
    public static async getActionInstance(actionId: string) {
        try {
            let getActionRequest = new actionSDK.GetAction.Request(actionId);
            let response = await actionSDK.executeApi(getActionRequest) as actionSDK.GetAction.Response;
            return { success: true, action: response.action };
        } catch (error) {
            Logger.logError("getActionInstance Error: " + JSON.stringify(error));
            return { success: false, error: error };
        }
    }

    /*
    *   @desc Service API Request for getting the actionInstance responses
    */
    public static async getActionDataRows(actionId, creatorId = null, continuationToken = null, pageSize = 30) {
        try {
            let getDataRowsRequest = new actionSDK.GetActionDataRows.Request(actionId, creatorId, continuationToken, pageSize);
            let response = await actionSDK.executeApi(getDataRowsRequest) as actionSDK.GetActionDataRows.Response;
            Logger.logInfo("getActionDataRows - Response" + JSON.stringify(response));
            return { success: true, dataRows: response.dataRows, continuationToken: response.continuationToken };
        } catch (error) {
            Logger.logError("getActionDataRows Error: " + JSON.stringify(error));
            return { success: false, error: error }
        }
    }

    /*
    *   @desc Service API Request for getting the responders details
    *   @param subscription - actionSDK.Subscription
    *   @param userIds - string array of all the datarows creatorId
    *   @return datarow responsder's details
    */
    public static async getResponderDetails(subscription: actionSDK.Subscription, userIds: string[]) {
        try {
            let requestResponders = new actionSDK.GetSubscriptionMembers.Request(subscription, userIds);
            let responseResponders = await actionSDK.executeApi(requestResponders) as actionSDK.GetSubscriptionMembers.Response;
            return { success: true, responders: responseResponders.members };
        } catch (error) {
            Logger.logError("getResponderDetails Error: " + JSON.stringify(error));
            return { success: false, error: error }
        }
    }

    /*
    *   @desc Service API to Update the status of action Instance
    *   @param updateInfo: object contains the new status for instance
    *   @return updateActionResponse: {id, error, success}
    */
    public static async updateActionInstance(actionInstance, data) {
        let action: actionSDK.ActionUpdateInfo = {
            id: actionInstance.id,
            version: actionInstance.version,
            displayName: actionInstance.displayName,
            dataTables: actionInstance.dataTables
        };
        for (let key in data) {
            action[key] = data[key];
        }
        let getUpdateActionRequest = new actionSDK.UpdateAction.Request(action);
        try {
            let response = await actionSDK.executeApi(getUpdateActionRequest) as actionSDK.UpdateAction.Response;
            Logger.logInfo("UpdateAction - Response: " + JSON.stringify(response));
            actionInstance = await ActionSdkHelper.getActionInstance(actionInstance.id);
            return actionInstance;
        } catch (error) {
            Logger.logError("UpdateAction - Error: " + JSON.stringify(error));
        }
    }

    /*
    *   @desc Service API to delete an action Instance
    *   @param actionId: context.actionId
    *   @return response: {id, error, success}
    */
    public static async deleteActionInstance(actionId) {
        try {
            let request = new actionSDK.DeleteAction.Request(actionId);
            let response = await actionSDK.executeApi(request) as actionSDK.DeleteAction.Response;
            return { success: true, deleteResponse: response };
        } catch (error) {
            Logger.logError("deleteActionInstance Error: " + JSON.stringify(error));
            return { success: false, error: error };
        }

    }

    /*
    * API to download CSV for the current action instance summary
    * @param actionId actionID
    * @param fileName filename of csv
    */
    public static async downloadResponseAsCSV(actionId: string, fileName: string) {
        try {
            let downloadCSVRequest = new actionSDK.DownloadActionDataRowsResult.Request(
                actionId,
                fileName
            );
            let downloadResponse = await actionSDK.executeApi(downloadCSVRequest) as actionSDK.DownloadActionDataRowsResult.Response;
            return downloadResponse;
        } catch (error) {
            Logger.logError("downloadResponseAsCSV Error: " + JSON.stringify(error)); //Add error log
        }
    }
    /*
    *   @desc Service API to Update the status of action Instance.
    *   @param updateInfo: object contains the new status for instance.
    *   @return updateActionResponse: {id, error, success}
    */
    public static async updateActionInstanceStatus(updateInfo) {
        try {
            let updateActionRequest = new actionSDK.UpdateAction.Request(updateInfo);
            let updateActionResponse = await actionSDK.executeApi(updateActionRequest) as actionSDK.UpdateAction.Response;
            return { success: true, updateResponse: updateActionResponse };
        } catch (error) {
            Logger.logError("updateActionInstanceStatus Error: " + JSON.stringify(error));
            return { success: false, error: error };
        }
    }

    /*
    *   @desc Service API to close the adaptive card opened
    */
    public static async closeCardView() {
        try {
            let closeViewRequest = new actionSDK.CloseView.Request();
            await actionSDK.executeApi(closeViewRequest);
        } catch (error) {
            Logger.logError("closeCardView Error: " + JSON.stringify(error));
        }
    }

    /*
     *   @desc Service API to:
     *   1. Add new items in checklist
     *   2. Update existing item details like value and status
     */
    public static async addOrUpdateDataRows(addRows, updateRows) {
        try {
            let addOrUpdateRowsRequest = new actionSDK.AddOrUpdateActionDataRows.Request(
                addRows,
                updateRows
            );
            let addOrUpdateResponse = await actionSDK.executeApi(addOrUpdateRowsRequest) as actionSDK.AddOrUpdateActionDataRows.Response;
            return { success: true, addOrUpdateResponse: addOrUpdateResponse };
        } catch (error) {
            Logger.logError("addOrUpdateDataRows Error: " + JSON.stringify(error));
            return { success: false, error: error }
        }
    }

    /*
    *   @desc Service API to hide the loader when the data load is successful to show the page or if failed then to show the error
    */
    public static async hideLoadIndicator() {
        try {
            await actionSDK.executeApi(new actionSDK.HideLoadingIndicator.Request());
        } catch (error) {
            Logger.logError("hideLoadIndicator Error: " + JSON.stringify(error));
        }
    }
}
