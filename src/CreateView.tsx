// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import * as ReactDom from "react-dom";
import CreationPage from "./components/creation/CreationPage";
import { initialize } from "./actions/CreationActions";
import { ActionRootView } from "./components/ActionRootView";

initialize();
ReactDom.render(
    <ActionRootView>
        <CreationPage />
    </ActionRootView>,
    document.getElementById("root"));
