// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import { Utils } from "../../utils/Utils";

/**
 * A functional component which reads out the alert on screen
 * Functional components are supposed to start with uppercase
 * While calling make sure you have only 1 alert per screen
 * @param alertText :text which will be read out
 */

export function AccessibilityAlert(props) {
    return (!Utils.isEmptyString(props.alertText)
        && <div role="alert" aria-label={props.alertText} />);
}
