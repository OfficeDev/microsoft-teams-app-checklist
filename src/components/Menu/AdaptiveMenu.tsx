// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";

import { Menu, Text, Flex, Dialog } from "@fluentui/react-northstar";
import { AdaptiveMenuItem } from "./AdaptiveMenuItem";

import "./AdaptiveMenu.scss";

export enum AdaptiveMenuRenderStyle {
    MENU,
    ACTIONSHEET
}

export interface IAdaptiveMenuProps {
    key: string;
    content: React.ReactNode;
    menuItems: AdaptiveMenuItem[];
    renderAs: AdaptiveMenuRenderStyle;
    className?: string;
    dismissMenuAriaLabel?: string;
}

export interface IAdaptiveMenuState {
    menuOpen: boolean;
}

export class AdaptiveMenu extends React.Component<IAdaptiveMenuProps, IAdaptiveMenuState> {

    constructor(props) {
        super(props);
        this.state = {
            menuOpen: false
        };
    }

    render() {
        switch (this.props.renderAs) {
            case AdaptiveMenuRenderStyle.ACTIONSHEET:
                return this.getActionSheet();
            case AdaptiveMenuRenderStyle.MENU:
            default:
                return this.getMenu();
        }
    }

    private getActionSheet() {
        return (
            <>
                <Flex className="actionsheet-trigger-bg" onClick={() => { this.setState({ menuOpen: !this.state.menuOpen }); }}>
                    {this.props.content}
                </Flex>
                <Dialog
                    open={this.state.menuOpen}
                    className="hide-default-dialog-container"
                    content={
                        <Flex className="actionsheet-view-bg" onClick={() => { this.setState({ menuOpen: !this.state.menuOpen }); }}>
                            {this.getDismissButtonForActionSheet()}
                            <Flex role="menu" column className="actionsheet-view-container">
                                {this.getActionSheetItems()}
                            </Flex>
                        </Flex>
                    }
                />
            </>
        );
    }

    private getActionSheetItems(): AdaptiveMenuItemComponent[] {
        let actionSheetItems = [];
        let index = 0;
        this.props.menuItems.forEach((menuItem) => {
            let menuItemProps: IAdaptiveMenuItemComponentProps = {
                menuItem: menuItem
            };
            actionSheetItems.push(<AdaptiveMenuItemComponent {...menuItemProps}
                ref={(ref: AdaptiveMenuItemComponent) => {
                    if (index === 0 && ref) {
                        ref.focusCurrentItem();
                    }
                    index++;
                }} />);
        });
        return actionSheetItems;
    }

    private getDismissButtonForActionSheet() {
        // Hidden Dismiss button for accessibility
        return (
            <Flex
                className="hidden-dismiss-button"
                role="button"
                aria-hidden={false}
                tabIndex={0}
                aria-label={this.props.dismissMenuAriaLabel}
                onClick={() => {
                    this.setState({ menuOpen: !this.state.menuOpen });
                }}
            />
        );
    }

    private getMenu() {
        let menuItems: AdaptiveMenuItem[];
        menuItems = Object.assign([], this.props.menuItems);
        for (let i = 0; i < menuItems.length; i++) {
            menuItems[i].className = "menu-item " + menuItems[i].className;
        }
        return (
            <Menu
                defaultActiveIndex={0}
                className={(this.props.className ? this.props.className : "") + " menu-default"}
                items={
                    [
                        {
                            key: this.props.key,
                            "aria-hidden": true,
                            content: this.props.content,
                            className: "menu-items",
                            indicator: null,
                            menu: {
                                items: menuItems
                            }
                        }
                    ]
                }
            />
        );
    }

}

interface IAdaptiveMenuItemComponentProps {
    menuItem: AdaptiveMenuItem;
}

class AdaptiveMenuItemComponent extends React.PureComponent<IAdaptiveMenuItemComponentProps> {

    private ref: HTMLElement;

    render() {
        return (
            <div role="menuitem" tabIndex={0}
                className="actionsheet-item-container" key={this.props.menuItem.key}
                onClick={() => { this.props.menuItem.onClick(); }}
                ref={(ref: HTMLElement) => {
                    if (ref) {
                        this.ref = ref;
                    }
                }}>
                {this.props.menuItem.icon}
                <Text className="actionsheet-item-label" content={this.props.menuItem.content} />
            </div>
        );
    }

    public focusCurrentItem(): void {
        if (this.ref) {
            this.ref.focus();
        }
    }

}
