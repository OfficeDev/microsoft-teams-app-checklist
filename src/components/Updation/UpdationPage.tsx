// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import { observer } from "mobx-react";
import getStore from "../../store/UpdationStore";
import {
    updateActionInstance,
    addChoice,
    toggleDeleteChoice,
    updateChoiceText,
    changeItemCheckedStatus,
    checklistCloseAlertOpen,
    closeChecklist,
    checklistDeleteAlertOpen,
    deleteChecklist,
    checklistExpiryChangeAlertOpen,
    setDownloadingData,
    addActionInstance
} from "../../actions/UpdationActions";
import "../Updation/Updation.scss";
import {
    Flex,
    Dialog,
    Text,
    FlexItem,
    Loader,
    ButtonProps,
    MoreIcon,
    CalendarIcon,
    BanIcon,
    TrashCanIcon,
    Button
} from "@fluentui/react-northstar";
import {
    ChecklistGroupType,
} from "../../utils";
import { isChecklistExpired } from "../../helper/UpdationHelper";
import { ChecklistGroupContainer } from "./ChecklistGroupContainer";
import {
    isChecklistClosed,
    getDateString,
    isChecklistCreatedByMe,
    isChecklistDirty,
} from "../../helper/UpdationHelper";

import * as actionSDK from "@microsoft/m365-action-sdk";
import { Localizer } from "../../utils/Localizer";
import { AdaptiveMenuItem, AdaptiveMenu, AdaptiveMenuRenderStyle } from "../Menu";
import { UxUtils } from "../../utils/UxUtils";
import { ProgressState } from "../../utils/SharedEnum";
import { Constants } from "../../utils/Constants";
import { ErrorView } from "../ErrorView";
import { ShimmerContainer } from "../ShimmerLoader";
import { AccessibilityAlert } from "../AccessibilityAlert/AccessibilityAlert";
import { ActionSdkHelper } from "../../helper/ActionSdkHelper";

@observer
export default class UpdationPage extends React.Component<any, any> {
    render() {
        let hostContext: actionSDK.ActionSdkContext = getStore().context;
        if (hostContext) {
            ActionSdkHelper.hideLoadIndicator();
        } else {
            if (getStore().progressState == ProgressState.NotStarted || getStore().progressState == ProgressState.InProgress) {
                return <Loader />;
            }
        }

        if (getStore().isActionDeleted) {
            ActionSdkHelper.hideLoadIndicator();
            return (
                <ErrorView
                    title={Localizer.getString("ChecklistDeletedError")}
                    subtitle={Localizer.getString("ChecklistDeletedErrorDescription")}
                    buttonTitle={Localizer.getString("Close")}
                    image={"./images/actionDeletedError.png"}
                />
            );
        }

        if (getStore().progressState === ProgressState.Failed) {
            ActionSdkHelper.hideLoadIndicator();
            return (
                <ErrorView
                    title={Localizer.getString("GenericError")}
                    buttonTitle={Localizer.getString("Close")}
                />
            );
        }

        if (getStore().progressState == ProgressState.Completed) {
            ActionSdkHelper.hideLoadIndicator();
        }

        return (
            <>
                <Flex column className="body-container no-mobile-footer">
                    {this.getHeaderContainer()}
                    {this.getHintText()}
                    {this.getItemsGroupSection(ChecklistGroupType.Open)}
                    {getStore().progressState == ProgressState.Completed &&
                        this.getItemsGroupSection(ChecklistGroupType.Completed)}
                </Flex>
                {
                    getStore().progressState != ProgressState.Completed
                        ? null
                        : this.getFooterSection()}
            </>
        );
    }

    /* Show due date for open checklist else show "checklist expired/closed" text */
    getHintText() {
        if (isChecklistExpired()) {
            return (
                <Text className="hint-text error" size="small">
                    {Localizer.getString("ChecklistExpired")}
                </Text>
            );

        } else if (isChecklistClosed()) {
            return (
                <Text className="hint-text error" size="small">
                    {" "}
                    {Localizer.getString("ChecklistClosed")}
                </Text>
            );
        }
        return null;
    }

    getItemsGroupSection(checklistGroupType: ChecklistGroupType) {
        return (
            <ChecklistGroupContainer
                sectionType={checklistGroupType}
                items={getStore().items}
                toggleDeleteChoice={(i) => {
                    toggleDeleteChoice(i);
                }}
                addChoice={() => {
                    addChoice();
                }}
                updateChoiceText={(i, value) => {
                    updateChoiceText(i, value);
                }}
                changeItemCheckedStatus={(i, value) => {
                    changeItemCheckedStatus(i, value);
                }}
                showShimmer={
                    checklistGroupType == ChecklistGroupType.Open &&
                    getStore().progressState != ProgressState.Completed
                }
            />
        );
    }

    getCloseAlertDialog() {
        if (getStore().isChecklistCloseAlertOpen) {
            return (
                <Dialog
                    className="dialog-base"
                    overlay={{
                        className: "dialog-overlay",
                    }}
                    open={getStore().isChecklistCloseAlertOpen}
                    onOpen={(e, { open }) => checklistCloseAlertOpen(open)}
                    cancelButton={this.getDialogButtonProps(
                        Localizer.getString("CloseChecklist"),
                        Localizer.getString("Cancel")
                    )}
                    confirmButton={
                        getStore().closingChecklist && !getStore().closeChecklistFailed ? (
                            <Loader size="small" />
                        ) : (
                                this.getDialogButtonProps(
                                    Localizer.getString("CloseChecklist"),
                                    Localizer.getString("Confirm")
                                )
                            )
                    }
                    content={
                        <Flex gap="gap.smaller" column>
                            <Text
                                content={
                                    isChecklistDirty()
                                        ? Localizer.getString("CloseAndSaveAlertDialogMessage")
                                        : Localizer.getString("CloseAlertDialogMessage")
                                }
                            />
                            {getStore().closeChecklistFailed ? (
                                <Text
                                    content={Localizer.getString("SomethingWentWrong")}
                                    className="error"
                                />
                            ) : null}
                            {getStore().closeChecklistFailed ? (
                                <AccessibilityAlert
                                    alertText={Localizer.getString("SomethingWentWrong")}
                                />
                            ) : null}
                        </Flex>
                    }
                    header={Localizer.getString("CloseChecklist")}
                    onCancel={() => {
                        checklistCloseAlertOpen(false);
                    }}
                    onConfirm={() => {
                        closeChecklist(true);
                    }}
                />
            );
        }
    }

    getDialogButtonProps(
        dialogDescription: string,
        buttonLabel: string
    ): ButtonProps {
        let buttonProps: ButtonProps = {
            content: buttonLabel,
        };

        if (UxUtils.renderingForMobile()) {
            Object.assign(buttonProps, {
                "aria-label": Localizer.getString(
                    "DialogTalkback",
                    dialogDescription,
                    buttonLabel
                ),
            });
        }
        return buttonProps;
    }

    getDeleteAlertDialog() {
        if (getStore().isChecklistDeleteAlertOpen) {
            return (
                <Dialog
                    className="dialog-base"
                    overlay={{
                        className: "dialog-overlay",
                    }}
                    open={getStore().isChecklistDeleteAlertOpen}
                    onOpen={(e, { open }) => checklistDeleteAlertOpen(open)}
                    cancelButton={this.getDialogButtonProps(
                        Localizer.getString("DeleteChecklist"),
                        Localizer.getString("Cancel")
                    )}
                    confirmButton={
                        getStore().deletingChecklist &&
                            !getStore().deleteChecklistFailed ? (
                                <Loader size="small" />
                            ) : (
                                this.getDialogButtonProps(
                                    Localizer.getString("DeleteChecklist"),
                                    Localizer.getString("Confirm")
                                )
                            )
                    }
                    content={
                        <Flex gap="gap.smaller" column>
                            <Text content={Localizer.getString("DeleteAlertDialogMessage")} />
                            {getStore().deleteChecklistFailed ? (
                                <Text
                                    content={Localizer.getString("SomethingWentWrong")}
                                    className="error"
                                />
                            ) : null}
                            {getStore().deleteChecklistFailed ? (
                                <AccessibilityAlert
                                    alertText={Localizer.getString("SomethingWentWrong")}
                                />
                            ) : null}
                        </Flex>
                    }
                    header={Localizer.getString("DeleteChecklist")}
                    onCancel={() => {
                        checklistDeleteAlertOpen(false);
                    }}
                    onConfirm={() => {
                        deleteChecklist(true);
                    }}
                />
            );
        }
    }

    getExpiryUpdateDialog() {
        if (getStore().actionInstance && getStore().isChecklistExpiryAlertOpen) {
            return (
                <Dialog
                    className="due-date-dialog"
                    overlay={{
                        className: "dialog-overlay",
                    }}
                    open={getStore().isChecklistExpiryAlertOpen}
                    onOpen={(e, { open }) => checklistExpiryChangeAlertOpen(open)}
                    cancelButton={Localizer.getString("Cancel")}
                    confirmButton={
                        getStore().updatingDueDate ? (
                            <Loader size="small" />
                        ) : (
                                Localizer.getString("Change")
                            )
                    }

                    header="Action confirmation"
                    onCancel={() => {
                        checklistExpiryChangeAlertOpen(false);
                    }}
                    onConfirm={() => {
                        let actionInstance: actionSDK.Action = {
                            ...getStore().actionInstance,
                        };
                        addActionInstance(actionInstance);
                    }}
                />
            );
        } else {
            return null;
        }
    }

    getFooterSection() {
        return (
            <Flex className="footer-layout" gap="gap.small">
                {getStore().saveChangesFailed || getStore().downloadReportFailed ? (
                    <Text
                        content={Localizer.getString("SomethingWentWrong")}
                        className="error"
                    />
                ) : null}
                {getStore().saveChangesFailed || getStore().downloadReportFailed ? (
                    <AccessibilityAlert
                        alertText={Localizer.getString("SomethingWentWrong")}
                    />
                ) : null}

                {!UxUtils.renderingForMobile() ?
                    (<FlexItem push>
                        <Button
                            secondary
                            loading={getStore().downloadingData}
                            disabled={getStore().downloadingData}
                            content={Localizer.getString("DownloadReport")}
                            onClick={() => {
                                setDownloadingData(true);
                            }}
                        />
                    </FlexItem>) : null}

                {!UxUtils.renderingForMobile() ?
                    (<Button
                        loading={getStore().isSending}
                        disabled={isChecklistExpired() || isChecklistClosed()}
                        primary
                        content={Localizer.getString("SaveChanges")}
                        onClick={() => {
                            updateActionInstance();
                        }}
                    />) :
                    (<FlexItem push>
                        <Button
                            loading={getStore().isSending}
                            disabled={isChecklistExpired() || isChecklistClosed()}
                            primary
                            content={Localizer.getString("SaveChanges")}
                            onClick={() => {
                                updateActionInstance();
                            }}
                        />
                    </FlexItem>)}
            </Flex>
        );
    }

    private getHeaderContainer(): JSX.Element {
        return (
            <ShimmerContainer
                fill
                showShimmer={!getStore().actionInstance}
                width={["50%"]}
            >
                <Flex vAlign="center" className={"header-container"}>
                    <Text size="large" weight="bold">
                        {getStore().actionInstance
                            ? getStore().actionInstance.displayName
                            : "ChecklistTitle"}
                    </Text>
                    {this.getMenu()}
                    {this.getCloseAlertDialog()}
                    {this.getDeleteAlertDialog()}
                </Flex>
            </ShimmerContainer>
        );
    }

    private getMenu() {
        let menuItems: AdaptiveMenuItem[] = this.getMenuItems();
        if (menuItems.length == 0) {
            return null;
        }
        return (
            <AdaptiveMenu
                key="checklist_options"
                className="triple-dot-menu"
                renderAs={
                    UxUtils.renderingForMobile()
                        ? AdaptiveMenuRenderStyle.ACTIONSHEET
                        : AdaptiveMenuRenderStyle.MENU
                }
                content={
                    <MoreIcon
                        title={Localizer.getString("MoreOptions")}
                        outline
                        aria-hidden={false}
                        role="button"
                    />
                }
                menuItems={menuItems}
                dismissMenuAriaLabel={Localizer.getString("DismissMenu")}
            />
        );
    }

    private getMenuItems(): AdaptiveMenuItem[] {
        let menuItemList: AdaptiveMenuItem[] = [];
        if (isChecklistCreatedByMe()) {
            if (!isChecklistClosed() && !isChecklistExpired()) {
                let closeCL: AdaptiveMenuItem = {
                    key: "close",
                    content: Localizer.getString("CloseChecklist"),
                    icon: <BanIcon outline={true} />,
                    onClick: () => {
                        checklistCloseAlertOpen(true);
                    },
                };
                menuItemList.push(closeCL);
            }
            let deleteCL: AdaptiveMenuItem = {
                key: "delete",
                content: Localizer.getString("DeleteChecklist"),
                icon: <TrashCanIcon outline={true} />,
                onClick: () => {
                    checklistDeleteAlertOpen(true);
                },
            };
            menuItemList.push(deleteCL);
        }
        return menuItemList;
    }
}
