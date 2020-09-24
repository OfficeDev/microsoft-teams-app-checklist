// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum ActionErrorCode {
    Unknown = "Unknown",
    Unauthorized = "Unauthorized",
    ServerError = "ServerError",
    BadRequest = "BadRequest",
    UnsupportedApi = "UnsupportedApi",
    InvalidOperation = "InvalidOperation",
    IOException = "IOException"
}

export interface ActionError {
    errorCode: ActionErrorCode;
    errorMessage: string;
    errorProps?: any;
}
