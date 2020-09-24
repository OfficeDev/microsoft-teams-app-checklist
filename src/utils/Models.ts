// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Status, ChecklistItemState } from "./EnumContainer";
import {Utils} from "./Utils";

export class ChecklistItem {
    title: string;
    status: Status;
    subTitle: string;
    itemState: ChecklistItemState;
    rowId: string;
    creationTime: string;
    localKey: string;
    creatorUserId?: string;
    completedUserId?: string;
    completionTime?: string;
    serverStatus?: Status;
    serverCompletionTime?: string;
    constructor(title: string = "", status: Status = Status.ACTIVE, subTitle: string = "", itemState: ChecklistItemState = ChecklistItemState.GENERATED, rowId: string = "",
                creationTime: string = "", localKey: string = "", creatorUserId: string = "", completedUserId: string = "", completionTime: string = "", serverStatus: Status = Status.ACTIVE, serverCompletionTime: string = "") {
        this.title = title;
        this.status = status;
        this.subTitle = subTitle;
        this.itemState = itemState;
        this.rowId = rowId;
        if (creationTime) {
            this.creationTime = creationTime;
        } else {
            this.creationTime = new Date().getTime().toString();
        }
        if (localKey) {
            this.localKey = localKey;
        } else {
            this.localKey = Utils.generateGUID();
        }
        this.creatorUserId = creatorUserId;
        this.completedUserId = completedUserId;
        this.completionTime = completionTime;
        this.serverStatus = serverStatus;
        this.serverCompletionTime = serverCompletionTime;
    }

    public clone(): ChecklistItem {
        return new ChecklistItem(this.title, this.status, this.subTitle, this.itemState, this.rowId,
            this.creationTime, this.localKey, this.creatorUserId, this.completedUserId, this.completionTime, this.serverStatus, this.serverCompletionTime);
    }
}

export class ChecklistItemRow {
    checklistItem: string = "";
    status: string = "";
    completionTime: string = "";
    completionUser: string = "";
    latestEditTime: string = "";
    latestEditUser: string = "";
    creationTime: string = "";
    creationUser: string = "";
    deletionTime: string = "";
    deletionUser: string = "";
}
