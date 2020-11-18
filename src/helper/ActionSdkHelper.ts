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
        let response = await actionSDK.executeApi(request) as actionSDK.GetLocalizedStrings.Response;
        if (!response.error) {
            return { success: true, strings: response.strings };
        }
        else {
            Logger.logError(`fetchLocalization failed, Error: ${response.error.category}, ${response.error.code}, ${response.error.message}`);
        }
    }

    /*
    * @desc Service Request to create new Action Instance
    * @param {actionSDK.Action} action instance which need to get created
    */
    public static async createActionInstance(action: actionSDK.Action) {
        let request = new actionSDK.CreateAction.Request(action);
        let response = await actionSDK.executeApi(request) as actionSDK.CreateAction.Response;
        if (!response.error) {
            Logger.logInfo(`createActionInstance success - Request: ${JSON.stringify(request)} Response: ${JSON.stringify(response)}`);
        }
        else {
            Logger.logError(`createActionInstance failed, Error: ${response.error.category}, ${response.error.code}, ${response.error.message}`);
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
        let response = await actionSDK.executeApi(new actionSDK.GetContext.Request()) as actionSDK.GetContext.Response;
        if (!response.error) {
            return { success: true, context: response.context };
        }
        else {
            Logger.logError(`GetContext failed, Error: ${response.error.category}, ${response.error.code}, ${response.error.message}`);
            return { success: false, error: response.error };
        }
    }

    /*
    *   @desc Service API Request for getting the actionInstance
    *   @param context - actionInstance context: actionSDK.ActionSdkContext
    */
    public static async getActionInstance(actionId: string) {
        let getActionRequest = new actionSDK.GetAction.Request(actionId);
        let response = await actionSDK.executeApi(getActionRequest) as actionSDK.GetAction.Response;
        if (!response.error) {
            return { success: true, action: response.action };
        } else {
            Logger.logError(`GetAction failed, Error: ${response.error.category}, ${response.error.code}, ${response.error.message}`);
            return { success: false, error: response.error };
        }
    }

    /*
    *   @desc Service API Request for getting the actionInstance responses
    */
    public static async getActionDataRows(actionId, creatorId = null, continuationToken = null, pageSize = 30) {
        let request = new actionSDK.GetActionDataRows.Request(actionId, creatorId, continuationToken, pageSize);
        let response = await actionSDK.executeApi(request) as actionSDK.GetActionDataRows.Response;
        if (!response.error) {
            Logger.logInfo(`getActionDataRows success - Request: ${JSON.stringify(request)} Response: ${JSON.stringify(response)}`);
            return { success: true, dataRows: response.dataRows, continuationToken: response.continuationToken };
        }
        else {
            Logger.logError(`getActionDataRows failed, Error: ${response.error.category}, ${response.error.code}, ${response.error.message}`);
            return { success: false, error: response.error };
        }
    }

    /*
    *   @desc Service API Request for getting the responders details
    *   @param subscription - actionSDK.Subscription
    *   @param userIds - string array of all the datarows creatorId
    *   @return datarow responsder's details
    */
    public static async getResponderDetails(subscription: actionSDK.Subscription, userIds: string[]) {
        let request = new actionSDK.GetSubscriptionMembers.Request(subscription, userIds);
        let response = await actionSDK.executeApi(request) as actionSDK.GetSubscriptionMembers.Response;
        if (!response.error) {
            return { success: true, responders: response.members };
        }
        else {
            Logger.logError(`GetSubscriptionMembers failed, Error: ${response.error.category}, ${response.error.code}, ${response.error.message}`);
            return { success: false, error: response.error };
        }
    }

    /*
    *   @desc Service API to delete an action Instance
    *   @param actionId: context.actionId
    *   @return response: {id, error, success}
    */
    public static async deleteActionInstance(actionId) {
        let request = new actionSDK.DeleteAction.Request(actionId);
        let response = await actionSDK.executeApi(request) as actionSDK.DeleteAction.Response;
        if (!response.error) {
            return { success: true, deleteResponse: response };
        }
        else {
            Logger.logError(`DeleteAction failed, Error: ${response.error.category}, ${response.error.code}, ${response.error.message}`);
            return { success: false, error: response.error };
        }

    }

    /*
    * API to download CSV for the current action instance summary
    * @param actionId actionID
    * @param fileName filename of csv
    */
    public static async downloadResponseAsCSV(actionId: string, fileName: string) {
        let downloadCSVRequest = new actionSDK.DownloadActionDataRowsResult.Request(
            actionId,
            fileName
        );
        let response = await actionSDK.executeApi(downloadCSVRequest) as actionSDK.DownloadActionDataRowsResult.Response;
        if (!response.error) {
            return response;
        }
        else {
            Logger.logError(`DeleteAction failed, Error: ${response.error.category}, ${response.error.code}, ${response.error.message}`);
        }
    }
    /*
    *   @desc Service API to Update the status of action Instance.
    *   @param updateInfo: object contains the new status for instance.
    *   @return updateActionResponse: {id, error, success}
    */
    public static async updateActionInstanceStatus(updateInfo) {
        let request = new actionSDK.UpdateAction.Request(updateInfo);
        let response = await actionSDK.executeApi(request) as actionSDK.UpdateAction.Response;
        if (!response.error) {
            return { success: true, updateResponse: response };
        }
        else {
            Logger.logError(`UpdateAction failed, Error: ${response.error.category}, ${response.error.code}, ${response.error.message}`);
            return { success: false, error: response.error };
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
        let addOrUpdateRowsRequest = new actionSDK.AddOrUpdateActionDataRows.Request(
            addRows,
            updateRows
        );
        let response = await actionSDK.executeApi(addOrUpdateRowsRequest) as actionSDK.AddOrUpdateActionDataRows.Response;
        if (!response.error) {
            return { success: true, addOrUpdateResponse: response };
        }
        else {
            Logger.logError(`AddOrUpdateActionDataRows failed, Error: ${response.error.category}, ${response.error.code}, ${response.error.message}`);
            return { success: false, error: response.error };
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
