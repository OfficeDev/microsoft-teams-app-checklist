// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import { Flex, Text, AddIcon } from "@fluentui/react-northstar";
import { ChecklistGroupType, ChecklistItem } from "../../../utils/index";
import { ChecklistItemsContainer } from "../../ChecklistItemsContainer";
import "./ChecklistGroupContainer.scss";
import {
    isChecklistExpired,
    isChecklistClosed
} from "../../../helper/UpdationHelper";
import { Status } from "../../../utils/EnumContainer";
import { Localizer } from "../../../utils/Localizer";
import { UxUtils } from "../../../utils/UxUtils";
import { ShimmerContainer } from "../../ShimmerLoader";
import { Constants } from "../../../utils/Constants";

export interface IChecklistGroupContainerProps {
    sectionType: ChecklistGroupType;
    items: ChecklistItem[];
    addChoice?: () => void;
    toggleDeleteChoice?: (i: ChecklistItem) => void;
    updateChoiceText?: (i: ChecklistItem, value: string) => void;
    changeItemCheckedStatus?: (i: ChecklistItem, value: boolean) => void;
    showShimmer: boolean;
}

export class ChecklistGroupContainer extends React.Component<
    IChecklistGroupContainerProps
    > {
    private checklistItemsRef;

    constructor(props: IChecklistGroupContainerProps) {
        super(props);
        this.checklistItemsRef = React.createRef();
    }

    render() {
        let containerName = this.props.sectionType + "-checklist-items-container";
        return (
            <div className="checklist-items-container-section">
                {this.renderGroupContainer(
                    containerName,
                    this.props,
                    this.checklistItemsRef
                )}
            </div>
        );
    }

    private addMoreItems(checklistItem: ChecklistGroupType) {
        if (checklistItem == ChecklistGroupType.Open) {
            return true;
        }
        return false;
    }

    private renderGroupContainer(
        containerName: string,
        props: IChecklistGroupContainerProps,
        checklistItemsRef: any
    ) {
        let onAddChoice = () => {
            if (props.addChoice) {
                props.addChoice();
                checklistItemsRef.getFocusToLastElement();
                if (!UxUtils.renderingForiOS()) {
                    document.getElementById(Constants.ADD_ITEM_DIV_ID).scrollIntoView();
                }
            }
        };

        let containerView: JSX.Element = (
            <div>
                <Flex column id={containerName}>
                    <ChecklistItemsContainer
                        sectionType={props.sectionType}
                        items={props.items}
                        closed={isChecklistClosed()}
                        expired={isChecklistExpired()}
                        ref={(child) => (checklistItemsRef = child)}
                        onToggleDeleteItem={(i) => {
                            props.toggleDeleteChoice(i);
                        }}
                        onItemAdded={() => {
                            onAddChoice();
                        }}
                        onItemChecked={(i, value) => {
                            props.changeItemCheckedStatus(i, value);
                        }}
                        onUpdateItem={(i, value) => {
                            props.updateChoiceText(i, value);
                        }}
                    />
                    {/* Show add button if checklist group is of type open items */}
                    {this.addMoreItems(props.sectionType) &&
                        !isChecklistExpired() &&
                        !isChecklistClosed() ? (
                            <div
                                id={Constants.ADD_ITEM_DIV_ID}
                                className="add-options-cl"
                                {...UxUtils.getTabKeyProps()}
                                onClick={() => {
                                    onAddChoice();
                                }}
                            >
                                <AddIcon outline size="medium" color="brand" />
                                <Text
                                    className="add-options-cl-label"
                                    content={Localizer.getString("AddRow")}
                                    color="brand"
                                />
                            </div>
                        ) : null}
                </Flex>
            </div>
        );

        let sectionLength: number = 0;

        if (props.items) {
            if (props.sectionType === ChecklistGroupType.Open) {
                props.items.forEach((element) => {
                    if (element.serverStatus == Status.ACTIVE) {
                        sectionLength++;
                    }
                });
            } else if (props.sectionType === ChecklistGroupType.Completed) {
                props.items.forEach((element) => {
                    if (element.serverStatus == Status.COMPLETED) {
                        sectionLength++;
                    }
                });
            }
        }

        return (
            <>
                <ShimmerContainer
                    lines={1}
                    width={["25%"]}
                    showShimmer={!!this.props.showShimmer}
                >
                    <Flex gap="gap.smaller">
                        <Text weight="bold" className="checklist-items-container-title">
                            {Localizer.getString(props.sectionType, sectionLength)}
                        </Text>
                    </Flex>
                </ShimmerContainer>
                <ShimmerContainer lines={4} showShimmer={!!this.props.showShimmer}>
                    {containerView}
                </ShimmerContainer>
            </>
        );
    }
}
