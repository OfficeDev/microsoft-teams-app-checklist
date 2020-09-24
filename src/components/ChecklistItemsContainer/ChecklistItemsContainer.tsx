// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import { Status, ChecklistItem } from "../../utils/index";
import "./ChecklistItemsContainer.scss";
import { ChecklistItemView, IChecklistItemProps } from "./ChecklistItemView";
import { ChecklistGroupType } from "../../utils/EnumContainer";
import {Constants} from "../../utils/Constants";

export interface IChecklistItemsContainerProps {
    sectionType: string;
    items: ChecklistItem[];
    closed: boolean;
    expired: boolean;
    onUpdateItem?: (i: ChecklistItem, value: string) => void;
    onToggleDeleteItem?: (i: ChecklistItem) => void;
    onItemChecked?: (i: ChecklistItem, value: boolean) => void;
    onItemAdded: () => void;
}

export class ChecklistItemsContainer extends React.Component<IChecklistItemsContainerProps> {

    private bringFocusToLastItem: boolean;
    private sortedItems: ChecklistItem[] = [];

    constructor(props) {
        super(props);
        this.bringFocusToLastItem = false;
    }

    getFocusToLastElement() {
        this.bringFocusToLastItem = true;
    }

    resetFocus() {
        this.bringFocusToLastItem = false;
    }

    render() {
        let items: JSX.Element[] = [];
        for (let i = 0; i < this.props.items.length; i++) {
            let autoFocus: boolean = (i == (this.props.items.length - 1) &&
                this.props.items[i].status == Status.ACTIVE &&
                this.bringFocusToLastItem);
            items.push(
                <ChecklistItemView
                    sectionType={this.props.sectionType}
                    item={this.props.items[i]}
                    key={this.getKeyForInput(i)}
                    autoFocus={autoFocus}
                    closed= {this.props.closed}
                    expired= {this.props.expired}
                    onToggleDeleteItem={i => {
                        this.props.onToggleDeleteItem(i);
                        this.resetFocus();
                        // Only for creation page delete doesn't contain undo and we need to shift the focus to next item when some item is deleted
                        if (this.props.sectionType == ChecklistGroupType.All) {
                            let nextItem: ChecklistItem = this.getNextItem(i);
                            if (nextItem) {
                                document.getElementById(nextItem.localKey).focus();
                            } else {
                                document.getElementById(Constants.ADD_ITEM_DIV_ID).focus();
                            }
                        }
                    }}
                    onItemAdded={() => {
                        this.addItem();
                    }}
                    onItemChecked={(i, value) => {
                        this.props.onItemChecked(i, value);
                        this.resetFocus();
                    }}
                    onUpdateItem={(i, value) => {
                        this.props.onUpdateItem(i, value);
                    }}
                    onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>, item: ChecklistItem) => {
                        //  Intercept Enter keypress to move focus to next item
                        if (!event.repeat &&
                            (event.which || event.keyCode) ==
                            Constants.CARRIAGE_RETURN_ASCII_VALUE) {
                            let nextItem: ChecklistItem = this.getNextItem(item);
                            if (nextItem) {
                                this.resetFocus();
                                document.getElementById(nextItem.localKey).focus();
                            } else if (item.status == Status.ACTIVE) {
                                this.addItem();
                            }
                        }
                    }}
                />
            );
        }
        if (items) {
            if (this.props.sectionType == ChecklistGroupType.Open) {
                items.sort((a: JSX.Element, b: JSX.Element) => {
                    let itemA = (a.props as IChecklistItemProps).item;
                    let itemB = (b.props as IChecklistItemProps).item;
                    return (itemA.creationTime > itemB.creationTime) ? 1 : ((itemB.creationTime > itemA.creationTime) ? -1 : 0);
                });
            } else if (this.props.sectionType == ChecklistGroupType.Completed) {
                items.sort((a: JSX.Element, b: JSX.Element) => {
                    let itemA = (a.props as IChecklistItemProps).item;
                    let itemB = (b.props as IChecklistItemProps).item;
                    return (itemA.serverCompletionTime < itemB.serverCompletionTime) ? 1 : ((itemB.serverCompletionTime < itemA.serverCompletionTime) ? -1 : 0);
                });
            }
        }
        this.sortedItems = [];
        for (let index = 0; index < items.length; index++) {
            this.sortedItems.push((items[index].props as IChecklistItemProps).item);
        }

        return <div className={"checklist-container"}>{items}</div>;
    }

    addItem() {
        if (this.props.onItemAdded) {
            this.props.onItemAdded();
            this.getFocusToLastElement();
        }
    }

    getNextItem(item: ChecklistItem): ChecklistItem {
        let found: boolean = false;
        let nextItem: ChecklistItem = null;
        if (item) {
            for (let index = 0; index < this.sortedItems.length; index++) {
                if (found && this.sortedItems[index].status === item.status) {
                    nextItem = this.sortedItems[index];
                    break;
                } else if (!found && this.sortedItems[index].localKey === item.localKey) {
                    found = true;
                }
            }
        }
        return nextItem;
    }

    getKeyForInput(i: number) {
        return this.props.sectionType + "_" + this.props.items[i].localKey;
    }
}
