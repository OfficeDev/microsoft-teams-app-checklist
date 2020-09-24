// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum ChecklistColumnType {
    checklistItem = "checklistItem",
    status = "status",
    completionTime = "completionTime",
    completionUser = "completionUser",
    latestEditTime = "latestEditTime",
    latestEditUser = "latestEditUser",
    creationTime = "creationTime",
    creationUser = "creationUser",
    deletionTime = "deletionTime",
    deletionUser = "deletionUser"
}

export enum ChecklistGroupType {
    Open = "Open",
    Completed = "Completed",
    Deleted = "Deleted",
    All = "All"
}

export enum Status {
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    DELETED = "DELETED"
}

export enum ChecklistItemState {
    GENERATED = "GENERATED",
    MODIFIED = "MODIFIED",
}
