// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import * as ReactDom from "react-dom";
import UpdationPage from "./components/updation/UpdationPage";
import { initialize } from "./actions/UpdationActions";
import { ActionRootView } from "./components/ActionRootView";

initialize();
ReactDom.render(
    <ActionRootView>
        <UpdationPage />
    </ActionRootView>,
    document.getElementById("root"));
