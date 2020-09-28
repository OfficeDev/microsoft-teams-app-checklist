// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createStore } from "satcheljs";
import { ChecklistItem } from "../utils";
import "../orchestrators/CreationOrchestrators";
import "../mutator/CreationMutator";
import * as actionSDK from "@microsoft/m365-action-sdk";
import { ProgressState } from "../utils/SharedEnum";

/**
 * Creation store containing all data required at the time of creation.
 */

interface IChecklistCreationStore {
    context: actionSDK.ActionSdkContext;
    title: string;
    items: ChecklistItem[];
    showBlankTitleError: boolean;
    progressState: ProgressState;
    isSending: boolean;
    canChecklistExpire: boolean;
}

const store: IChecklistCreationStore = {
    context: null,
    title: "",
    items: [new ChecklistItem()],
    showBlankTitleError: false,
    progressState: ProgressState.NotStarted,
    isSending: false,
    canChecklistExpire: false,
};

export default createStore<IChecklistCreationStore>("creationStore", store);
