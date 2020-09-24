// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

//import { IconProps } from "@fluentui/react-northstar";

export interface AdaptiveMenuItem {
    key: string;
    content: React.ReactNode;
    icon?: React.ReactNode;
    onClick: (event?) => void;
    className?: string;
}
