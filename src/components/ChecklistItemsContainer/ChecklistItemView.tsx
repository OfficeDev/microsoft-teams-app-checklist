// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import { Status, ChecklistItem } from "../../utils/index";
import "./ChecklistItemsContainer.scss";
import {
    Checkbox,
    Text,
    Input,
    ShorthandValue,
    InputProps,
    BoxProps,
    TrashCanIcon,
    UndoIcon,
} from "@fluentui/react-northstar";
import { ChecklistGroupType } from "../../utils/EnumContainer";
import { Localizer } from "../../utils/Localizer";
import { UxUtils } from "../../utils/UxUtils";

export interface IChecklistItemProps {
    sectionType: string;
    item: ChecklistItem;
    autoFocus: boolean;
    closed: boolean;
    expired: boolean;
    onUpdateItem?: (i: ChecklistItem, value: string) => void;
    onToggleDeleteItem?: (i: ChecklistItem) => void;
    onItemChecked?: (i: ChecklistItem, value: boolean) => void;
    onItemAdded: () => void;
    onKeyDown: (
        event: React.KeyboardEvent<HTMLDivElement>,
        item: ChecklistItem
    ) => void;
}

function getCheckedState(state: Status) {
    if (state == Status.COMPLETED) {
        return true;
    }
    return false;
}

export class ChecklistItemView extends React.Component<IChecklistItemProps> {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps) {
        if (
            nextProps.item.localKey == this.props.item.localKey &&
            nextProps.item.title == this.props.item.title &&
            nextProps.item.status == this.props.item.status
        ) {
            return false;
        }
        return true;
    }

    getDeleteIconProps(): ShorthandValue<BoxProps> {
        if (this.canDeleteItem()) {
            let title: string = Localizer.getString("DeleteRow");
            if (this.props.sectionType == ChecklistGroupType.All) {
                title = Localizer.getString("DeleteItem");
            }
            return {
                content: (
                    <TrashCanIcon
                        className="choice-trash-can pointer-cursor"
                        outline={true}
                        aria-hidden="false"
                        title={title}
                        aria-describedby={this.getTitleKey()}
                        role="button"
                        onClick={() => {
                            this.props.onToggleDeleteItem(this.props.item);
                        }}
                    />
                ),
                ...UxUtils.getTabKeyProps(),
            };
        } else if (this.isItemDeleted()) {
            return {
                content: (
                    <UndoIcon
                        className="choice-trash-can pointer-cursor"
                        outline={true}
                        aria-hidden="false"
                        title={Localizer.getString("UndoDeleteRow")}
                        aria-describedby={this.getTitleKey()}
                        role="button"
                        onClick={() => {
                            this.props.onToggleDeleteItem(this.props.item);
                        }}
                    />
                ),
                ...UxUtils.getTabKeyProps(),
            };
        }
        return null;
    }

    isReadOnly() {
        return (
            this.props.closed ||
            this.props.expired ||
            this.props.item.status != Status.ACTIVE
        );
    }

    isItemDeleted() {
        return this.props.item.status === Status.DELETED;
    }

    canDeleteItem() {
        return (
            !this.props.closed &&
            !this.props.expired &&
            this.props.item.status === Status.ACTIVE
        );
    }

    render() {
        if (
            this.props.sectionType == ChecklistGroupType.Open &&
            this.props.item.serverStatus != Status.ACTIVE
        ) {
            return null;
        } else if (
            this.props.sectionType == ChecklistGroupType.Completed &&
            this.props.item.serverStatus != Status.COMPLETED
        ) {
            return null;
        }

        return (
            <>
                <div
                    key={"option" + this.props.item.localKey}
                    className="checklist-item-container"
                >
                    <div className="checklist-item">
                        <div
                            key={"checkbox" + this.props.item.localKey}
                            className="checkbox-gap"
                        >
                            <Checkbox
                                aria-describedby={this.getTitleKey()}
                                className="checklist-checkbox"
                                checked={getCheckedState(this.props.item.status)}
                                disabled={
                                    this.props.expired ||
                                    this.props.closed ||
                                    this.isItemDeleted()
                                }
                                onChange={(e, props) => {
                                    this.props.onItemChecked(this.props.item, props.checked);
                                }}
                            />
                        </div>
                        <div className="checklist-input-box" key={this.getTitleKey()}>
                            <Input {...this.getInputProps()} />
                        </div>
                    </div>
                    <div
                        key={"subtitle" + this.props.item.localKey}
                        className="item-subtitle"
                    >
                        <Text size="small"> {this.props.item.subTitle} </Text>
                    </div>
                </div>
            </>
        );
    }

    getInputProps(): InputProps {
        let inputProps: InputProps = {
            autoFocus: this.props.autoFocus,
            maxLength: 4000,
            icon: this.getDeleteIconProps(),
            fluid: true,
            defaultValue: this.props.item.title,
            readOnly:
                this.props.expired ||
                this.props.closed ||
                this.props.item.status != Status.ACTIVE,
            input: {
                className: this.getInputStyle(),
                id: this.getTitleKey(),
                "aria-placeholder": this.props.item.title
                    ? this.props.item.title
                    : Localizer.getString("EmptyRowAriaPlaceHolder"),
            },
            onBlur: (e) => {
                this.props.onUpdateItem(
                    this.props.item,
                    (e.target as HTMLInputElement).value
                );
            },
            onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
                this.props.onKeyDown(event, this.props.item);
            },
        };

        if (UxUtils.renderingForMobile()) {
            Object.assign(inputProps, {
                disabled: this.isReadOnly(),
            });
        }
        return inputProps;
    }

    getTitleKey(): string {
        return this.props.item.localKey;
    }

    getInputStyle() {
        return !this.isReadOnly()
            ? "item-content icon-padding"
            : "item-content checklist-input-completed-item";
    }
}
